import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, Zap, User as UserIcon, BookOpen, Compass, Settings, LogOut, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'learn' | 'dictionary' | 'culture' | 'dashboard';
  setCurrentTab: (tab: 'home' | 'learn' | 'dictionary' | 'culture' | 'dashboard') => void;
  openAuthModal: () => void;
  openSettingsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openAuthModal,
  openSettingsModal,
}) => {
  const { user, activeLanguage, setActiveLanguage, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => {
              setCurrentTab('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-amber-200 font-bold shadow-xs">
              U
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-stone-900 group-hover:text-emerald-800 transition-colors whitespace-nowrap font-display">
                Usem Nnyin
              </span>
            </div>
          </button>

          {/* Zone 2: 4-5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-stone-600">
            <button
              onClick={() => setCurrentTab('home')}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                currentTab === 'home'
                  ? 'text-emerald-700 border-b-2 border-emerald-700'
                  : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentTab('learn')}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                currentTab === 'learn'
                  ? 'text-emerald-700 border-b-2 border-emerald-700'
                  : ''
              }`}
            >
              Academy
            </button>
            <button
              onClick={() => setCurrentTab('dictionary')}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                currentTab === 'dictionary'
                  ? 'text-emerald-700 border-b-2 border-emerald-700'
                  : ''
              }`}
            >
              Dictionary
            </button>
            <button
              onClick={() => setCurrentTab('culture')}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                currentTab === 'culture'
                  ? 'text-emerald-700 border-b-2 border-emerald-700'
                  : ''
              }`}
            >
              Heritage & Nsibidi
            </button>
            {user && (
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`hover:text-emerald-800 transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                  currentTab === 'dashboard'
                    ? 'text-emerald-700 border-b-2 border-emerald-700'
                    : ''
                }`}
              >
                Dashboard
              </button>
            )}
          </nav>

          {/* Zone 3: 1 primary action / user state */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Language Toggle */}
            <div className="hidden sm:flex items-center p-0.5 bg-stone-200/70 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveLanguage('ibibio')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  activeLanguage === 'ibibio'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Ibibio
              </button>
              <button
                onClick={() => setActiveLanguage('efik')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  activeLanguage === 'efik'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Efik
              </button>
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200/80 border border-stone-200 transition-all text-xs font-semibold text-stone-800 cursor-pointer"
                >
                  <div className="flex items-center gap-1 text-amber-600">
                    <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="tabular-nums font-bold">{user.current_streak}</span>
                  </div>
                  <div className="w-px h-3.5 bg-stone-300" />
                  <div className="flex items-center gap-1 text-emerald-700">
                    <Zap className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                    <span className="tabular-nums font-bold">{user.total_xp}</span>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-emerald-800 text-amber-100 flex items-center justify-center text-[10px] uppercase font-bold ml-1">
                    {user.display_name.charAt(0)}
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50 text-xs">
                    <div className="px-3.5 py-2 border-b border-stone-100">
                      <p className="font-semibold text-stone-900 truncate">{user.display_name}</p>
                      <p className="text-stone-500 truncate text-[11px]">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentTab('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-stone-50 flex items-center gap-2 text-stone-700 font-medium cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                      Learning Dashboard
                    </button>
                    <button
                      onClick={() => {
                        openSettingsModal();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-stone-50 flex items-center gap-2 text-stone-700 font-medium cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-stone-500" />
                      Goals & Notifications
                    </button>
                    <div className="border-t border-stone-100 my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-medium cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs hover:shadow-sm whitespace-nowrap cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 py-3 space-y-1">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 px-2">
              <span className="text-xs font-medium text-stone-500">Learning Language:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveLanguage('ibibio')}
                  className={`px-2 py-0.5 text-xs rounded font-medium ${
                    activeLanguage === 'ibibio' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  Ibibio
                </button>
                <button
                  onClick={() => setActiveLanguage('efik')}
                  className={`px-2 py-0.5 text-xs rounded font-medium ${
                    activeLanguage === 'efik' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  Efik
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                setCurrentTab('home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg"
            >
              Home
            </button>
            <button
              onClick={() => {
                setCurrentTab('learn');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg"
            >
              Academy (Lessons)
            </button>
            <button
              onClick={() => {
                setCurrentTab('dictionary');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg"
            >
              Bilingual Dictionary
            </button>
            <button
              onClick={() => {
                setCurrentTab('culture');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg"
            >
              Heritage & Nsibidi
            </button>
            {user && (
              <button
                onClick={() => {
                  setCurrentTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg"
              >
                Dashboard & Badges
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
