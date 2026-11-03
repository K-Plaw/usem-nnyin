import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LanguageCode, ProficiencyLevel } from '../types';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { apiUrl } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeLanguage: LanguageCode;
  isLoading: boolean;
  isFirebaseActive: boolean;
  setActiveLanguage: (lang: LanguageCode) => void;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string; cancelled?: boolean }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    display_name: string;
    selected_language: LanguageCode;
    proficiency_level: ProficiencyLevel;
  }) => Promise<{ success: boolean; error?: string }>;
  guestLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserPreferences: (data: {
    selected_language?: LanguageCode;
    proficiency_level?: ProficiencyLevel;
    daily_goal?: number;
    notification_preferences?: Partial<User['notification_preferences']>;
  }) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('usem_token') : null;
  });
  const [activeLanguage, setActiveLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('usem_lang') as LanguageCode) || 'ibibio';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirebaseActive, setIsFirebaseActive] = useState<boolean>(true);

  const setActiveLanguage = (lang: LanguageCode) => {
    setActiveLanguageState(lang);
    localStorage.setItem('usem_lang', lang);
    if (user && user.selected_language !== lang) {
      updateUserPreferences({ selected_language: lang });
    }
  };

  // Sync with Firebase Auth state
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const pathStr = `users/${fbUser.uid}`;

        try {
          const snapshot = await getDoc(userDocRef);
          const todayStr = new Date().toISOString().split('T')[0];

          if (!snapshot.exists()) {
            const initialUser: User = {
              id: fbUser.uid,
              display_name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Learner',
              email: fbUser.email || '',
              selected_language: activeLanguage,
              proficiency_level: 'beginner',
              total_xp: 0,
              current_streak: 0,
              longest_streak: 0,
              daily_goal: 50,
              daily_xp_today: 0,
              last_activity_date: todayStr,
              activity_dates: [todayStr],
              notification_preferences: {
                daily_reminder: true,
                reminder_time: '19:00',
                streak_freeze_alerts: true,
                browser_notifications: false,
              },
              created_at: new Date().toISOString(),
            };

            await setDoc(userDocRef, initialUser);
            setUser(initialUser);
            fetch(apiUrl('/api/auth/sync-user'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user: initialUser }),
            }).catch(() => {});
          } else {
            const loadedUser = snapshot.data() as User;
            setUser(loadedUser);
            fetch(apiUrl('/api/auth/sync-user'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user: loadedUser }),
            }).catch(() => {});
          }

          // Attach real-time snapshot listener
          unsubscribeSnapshot = onSnapshot(
            userDocRef,
            (docSnap) => {
              if (docSnap.exists()) {
                const updated = docSnap.data() as User;
                setUser(updated);
                if (updated.selected_language) {
                  setActiveLanguageState(updated.selected_language);
                }
              }
            },
            (error) => {
              handleFirestoreError(error, OperationType.GET, pathStr);
            }
          );

          setToken(fbUser.uid);
          localStorage.setItem('usem_token', fbUser.uid);
        } catch (error) {
          console.warn('Firestore user fetch failed, falling back:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Fallback to server local token if available
        if (token && !auth.currentUser) {
          refreshServerUser();
        } else {
          setIsLoading(false);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const refreshServerUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(apiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user?.selected_language) {
          setActiveLanguageState(data.user.selected_language);
        }
      } else {
        localStorage.removeItem('usem_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      try {
        const docSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (docSnap.exists()) {
          setUser(docSnap.data() as User);
        }
      } catch (err) {
        console.error('Failed to refresh Firestore user:', err);
      }
    } else {
      await refreshServerUser();
    }
  };

  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string; cancelled?: boolean }> => {
    if (isGoogleSigningIn) {
      return { success: false, cancelled: true };
    }
    setIsGoogleSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (error: any) {
      // Benign user cancellation or browser popup close
      if (
        error?.code === 'auth/cancelled-popup-request' ||
        error?.code === 'auth/popup-closed-by-user'
      ) {
        return { success: false, cancelled: true };
      }
      if (error?.code === 'auth/popup-blocked') {
        return {
          success: false,
          error: 'The Google sign-in pop-up was blocked by your browser. Please allow pop-ups or use email sign-in.',
        };
      }
      return {
        success: false,
        error: error?.message || 'Could not complete Google sign-in. Please try again or use email sign-in.',
      };
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to sign in' };
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('usem_token', data.token);
      if (data.user?.selected_language) {
        setActiveLanguageState(data.user.selected_language);
        localStorage.setItem('usem_lang', data.user.selected_language);
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Network error occurred. Please try again.' };
    }
  };

  const register = async (formData: {
    email: string;
    password: string;
    display_name: string;
    selected_language: LanguageCode;
    proficiency_level: ProficiencyLevel;
  }) => {
    try {
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('usem_token', data.token);
      setActiveLanguageState(data.user.selected_language);
      localStorage.setItem('usem_lang', data.user.selected_language);
      return { success: true };
    } catch {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const guestLogin = async () => {
    try {
      const res = await fetch(apiUrl('/api/auth/guest-login'), {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('usem_token', data.token);
        if (data.user?.selected_language) {
          setActiveLanguageState(data.user.selected_language);
        }
      }
    } catch (err) {
      console.error('Guest login failed:', err);
    }
  };

  const logout = async () => {
    try {
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
    } catch (e) {
      console.error('Signout error:', e);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('usem_token');
  };

  const updateUserPreferences = async (data: {
    selected_language?: LanguageCode;
    proficiency_level?: ProficiencyLevel;
    daily_goal?: number;
    notification_preferences?: Partial<User['notification_preferences']>;
  }) => {
    // If Firebase Auth user, update Firestore
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      try {
        await setDoc(userDocRef, data, { merge: true });
        setUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            ...data,
            notification_preferences: {
              ...prev.notification_preferences,
              ...(data.notification_preferences || {}),
            },
          };
        });
        return true;
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
      }
    }

    if (!token) return false;
    try {
      const res = await fetch(apiUrl('/api/auth/update'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setUser(result.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeLanguage,
        isLoading,
        isFirebaseActive,
        setActiveLanguage,
        signInWithGoogle,
        login,
        register,
        guestLogin,
        logout,
        updateUserPreferences,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
