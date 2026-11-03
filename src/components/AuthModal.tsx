import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LanguageCode, ProficiencyLevel } from '../types';
import { X, Sparkles, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { login, register, guestLogin, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('ibibio');
  const [proficiencyLevel, setProficiencyLevel] = useState<ProficiencyLevel>('beginner');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    if (mode === 'signin') {
      const res = await login(email, password);
      setIsLoading(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to sign in. Please verify your credentials.');
      }
    } else {
      if (!displayName.trim()) {
        setIsLoading(false);
        setErrorMsg('Please enter your full name.');
        return;
      }
      const res = await register({
        email,
        password,
        display_name: displayName,
        selected_language: selectedLanguage,
        proficiency_level: proficiencyLevel,
      });
      setIsLoading(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'Registration failed. Please try again.');
      }
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    await guestLogin();
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-amber-200 font-bold text-sm mb-2">
              U
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span>●</span> Firebase Firestore Active
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-stone-900 font-display">
            {mode === 'signin' ? 'Welcome Back' : 'Start Your Language Journey'}
          </h3>
          <p className="text-xs text-stone-500">
            {mode === 'signin'
              ? 'Sign in to access your lessons, track streaks, and earn XP.'
              : 'Create your account to preserve indigenous heritage.'}
          </p>
        </div>

        {/* 1-Click Google Firebase Sign In */}
        <button
          type="button"
          disabled={isLoading}
          onClick={async () => {
            if (isLoading) return;
            setIsLoading(true);
            setErrorMsg(null);
            const res = await signInWithGoogle();
            setIsLoading(false);
            if (res.success) {
              onClose();
            } else if (!res.cancelled && res.error) {
              setErrorMsg(res.error);
            }
          }}
          className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 disabled:bg-stone-100 disabled:opacity-70 border border-stone-300 text-stone-800 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.93H1.26v3.13C3.25 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.6H1.26C.46 8.22 0 10.05 0 12s.46 3.78 1.26 5.4l4.06-3.13z"
              />
              <path
                fill="#EA4335"
                d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.6l4.06 3.13c.94-2.83 3.58-4.96 6.68-4.96z"
              />
            </svg>
          )}
          <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google (Firebase)'}</span>
        </button>

        <div className="flex items-center gap-2 my-2 text-stone-300">
          <div className="h-px bg-stone-200 flex-1" />
          <span className="text-[11px] text-stone-400 font-medium">or continue with email</span>
          <div className="h-px bg-stone-200 flex-1" />
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-stone-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'signin' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'signup' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Ekpedeme Bassey"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Primary Learning Language
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLanguage('ibibio')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedLanguage === 'ibibio'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-1 ring-emerald-600'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    Ibibio (Akwa Ibom)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLanguage('efik')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedLanguage === 'efik'
                        ? 'bg-amber-50 border-amber-600 text-amber-950 ring-1 ring-amber-600'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    Efik (Cross River)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Proficiency Level
                </label>
                <select
                  value={proficiencyLevel}
                  onChange={(e) => setProficiencyLevel(e.target.value as ProficiencyLevel)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="beginner">Complete beginner (No previous knowledge)</option>
                  <option value="basic">Basic understanding (Can understand common phrases)</option>
                  <option value="intermediate">Intermediate (Heritage speaker / Can converse)</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>{mode === 'signin' ? 'Sign In to Account' : 'Complete Registration'}</span>
            )}
          </button>
        </form>

        {/* Demo Fast Login for Reviewers */}
        <div className="pt-2 border-t border-stone-100 space-y-2">
          <p className="text-[11px] text-stone-400 text-center">Evaluating the platform?</p>
          <button
            onClick={handleGuestSignIn}
            disabled={isLoading}
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>1-Click Demo Login (Ekpedeme Bassey)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
