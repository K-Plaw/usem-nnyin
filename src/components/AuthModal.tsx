import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LanguageCode, ProficiencyLevel } from '../types';
import { X, Sparkles, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { login, register, guestLogin } = useAuth();
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
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-amber-200 font-bold text-sm mb-2">
            U
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
