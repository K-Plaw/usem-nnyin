import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LanguageCode, ProficiencyLevel } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeLanguage: LanguageCode;
  isLoading: boolean;
  setActiveLanguage: (lang: LanguageCode) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    display_name: string;
    selected_language: LanguageCode;
    proficiency_level: ProficiencyLevel;
  }) => Promise<{ success: boolean; error?: string }>;
  guestLogin: () => Promise<void>;
  logout: () => void;
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

  const setActiveLanguage = (lang: LanguageCode) => {
    setActiveLanguageState(lang);
    localStorage.setItem('usem_lang', lang);
    if (user && user.selected_language !== lang) {
      updateUserPreferences({ selected_language: lang });
    }
  };

  const refreshUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/me', {
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

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
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
      const res = await fetch('/api/auth/register', {
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
      const res = await fetch('/api/auth/guest-login', {
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

  const logout = () => {
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
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/update', {
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
        setActiveLanguage,
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
