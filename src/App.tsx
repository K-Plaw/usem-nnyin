/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { DictionaryView } from './components/DictionaryView';
import { DashboardView } from './components/DashboardView';
import { CultureView } from './components/CultureView';
import { LessonModal } from './components/LessonModal';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { Lesson } from './types';
import { Sparkles, Trophy, X } from 'lucide-react';

function AppContent() {
  const { user, activeLanguage } = useAuth();
  const [currentTab, setCurrentTab] = useState<'home' | 'learn' | 'dictionary' | 'culture' | 'dashboard'>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [dictionarySearchQuery, setDictionarySearchQuery] = useState('');
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const handleLessonCompleted = (earnedXp: number, newAchievements: string[]) => {
    if (newAchievements.length > 0) {
      setToastNotification(`🏆 Achievement Unlocked: ${newAchievements.join(', ')}! +${earnedXp} XP`);
    } else {
      setToastNotification(`Sosọñọ! Lesson completed! +${earnedXp} XP awarded.`);
    }
    setTimeout(() => {
      setToastNotification(null);
    }, 5000);
  };

  const handleSearchDictionary = (query: string) => {
    setDictionarySearchQuery(query);
    setCurrentTab('dictionary');
  };

  const handleStartLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-900">
      {/* Achievement / Progress Toast */}
      {toastNotification && (
        <div className="fixed top-20 right-4 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-3 animate-slide-in text-xs font-bold max-w-sm">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="flex-1">{toastNotification}</span>
          <button
            onClick={() => setToastNotification(null)}
            className="text-stone-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAuthModal={() => setAuthModalOpen(true)}
        openSettingsModal={() => setSettingsModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <LandingPage
            setCurrentTab={setCurrentTab}
            openAuthModal={() => setAuthModalOpen(true)}
            onSearchDictionary={handleSearchDictionary}
          />
        )}

        {(currentTab === 'learn' || currentTab === 'dashboard') && (
          <DashboardView
            onStartLesson={handleStartLesson}
            openSettingsModal={() => setSettingsModalOpen(true)}
            openAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'dictionary' && (
          <DictionaryView
            initialSearchQuery={dictionarySearchQuery}
            defaultLanguage={activeLanguage}
          />
        )}

        {currentTab === 'culture' && <CultureView />}
      </main>

      {/* Interactive Lesson Modal */}
      {activeLesson && (
        <LessonModal
          lesson={activeLesson}
          onClose={() => setActiveLesson(null)}
          onLessonCompleted={handleLessonCompleted}
        />
      )}

      {/* Authentication Modal */}
      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}

      {/* Settings & Goals Modal */}
      {settingsModalOpen && <SettingsModal onClose={() => setSettingsModalOpen(false)} />}

      {/* Cultural Preservation Footer */}
      <Footer setCurrentTab={setCurrentTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
