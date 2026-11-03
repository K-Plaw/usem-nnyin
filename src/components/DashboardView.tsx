import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lesson, Achievement, LanguageCode } from '../types';
import { apiUrl } from '../lib/api';
import {
  Flame,
  Zap,
  Award,
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Crown,
  ChevronRight,
  TrendingUp,
  Compass,
  PartyPopper,
} from 'lucide-react';
import { triggerCelebrationConfetti, triggerStreakRecordFanfare, triggerCourseCompletionFireworks } from '../utils/confetti';
import { playLessonCompleteFanfare, playSuccessChime } from '../utils/audio';
import { LESSONS_DATABASE } from '../data/seedData';
import { getCompletedLessonIds, enrichLessonsWithProgress } from '../utils/progress';

interface DashboardViewProps {
  onStartLesson: (lesson: Lesson) => void;
  openSettingsModal: () => void;
  openAuthModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onStartLesson,
  openSettingsModal,
  openAuthModal,
}) => {
  const { user, token, activeLanguage, setActiveLanguage } = useAuth();
  const [lessons, setLessons] = useState<(Lesson & { is_completed?: boolean; is_unlocked?: boolean; score?: number })[]>([]);
  const [achievements, setAchievements] = useState<(Achievement & { is_unlocked: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAutoCelebrated, setHasAutoCelebrated] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  const handleCelebrateStreak = () => {
    setIsCelebrating(true);
    triggerStreakRecordFanfare();
    playLessonCompleteFanfare();
    setTimeout(() => setIsCelebrating(false), 2500);
  };

  useEffect(() => {
    if (user && user.current_streak > 0 && !hasAutoCelebrated) {
      const isRecord = user.current_streak >= (user.longest_streak || 1);
      if (isRecord && user.current_streak >= 1) {
        // Trigger celebration fanfare on dashboard load for maintaining streak or new record
        const timer = setTimeout(() => {
          triggerStreakRecordFanfare();
          playSuccessChime();
          setHasAutoCelebrated(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [user, hasAutoCelebrated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Retrieve all completed lesson IDs across Firestore + LocalStorage
      const completedIds = await getCompletedLessonIds(user?.id);
      const completedList = Array.from(completedIds).join(',');

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let fetchedLessons: Lesson[] = [];

      try {
        const [lessonsRes, achRes] = await Promise.all([
          fetch(
            apiUrl(
              `/api/lessons?language=${activeLanguage}${
                completedList ? `&completed_ids=${encodeURIComponent(completedList)}` : ''
              }`
            ),
            { headers }
          ),
          fetch(apiUrl('/api/achievements'), { headers }),
        ]);

        if (lessonsRes.ok) {
          const lData = await lessonsRes.json();
          fetchedLessons = lData.lessons;
        }
        if (achRes.ok) {
          const aData = await achRes.json();
          setAchievements(aData.achievements);
        }
      } catch (networkErr) {
        console.warn('Network call fell back to local curriculum:', networkErr);
      }

      if (!fetchedLessons || fetchedLessons.length === 0) {
        fetchedLessons = LESSONS_DATABASE.filter((l) => l.language === activeLanguage);
      }

      // Ensure lessons are accurately enriched with verified completed IDs
      const enriched = enrichLessonsWithProgress(fetchedLessons, completedIds);
      setLessons(enriched);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen to real-time progress update event dispatched when any module is completed
    const handleProgressUpdated = () => {
      fetchData();
    };

    window.addEventListener('usem:progress-updated', handleProgressUpdated);
    return () => {
      window.removeEventListener('usem:progress-updated', handleProgressUpdated);
    };
  }, [activeLanguage, token, user?.id]);

  const completedCount = lessons.filter((l) => l.is_completed).length;
  const coursePercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const isAllFinished = lessons.length > 0 && completedCount === lessons.length;
  const nextLesson = lessons.find((l) => !l.is_completed && l.is_unlocked) || lessons[0];

  const dailyGoalPercent = user
    ? Math.min(Math.round(((user.daily_xp_today || 0) / (user.daily_goal || 50)) * 100), 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: Greeting, Language switch, & Quick Continue */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                {activeLanguage === 'ibibio' ? 'Ibibio Learning Academy' : 'Efik Learning Academy'}
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-200 capitalize">
                Level: {user?.proficiency_level || 'Beginner'}
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                Firebase Firestore Connected
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-display leading-tight">
              {user ? (
                <>Emesiere, {user.display_name}!</>
              ) : (
                <>Welcome to the Indigenous Academy</>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
              {activeLanguage === 'ibibio'
                ? 'Continue your journey in Akwa Ibom Ibibio language through 7 interactive modules.'
                : 'Continue mastering Calabar Efik courtly salutations, proverbs, and vocabulary.'}
            </p>

            {/* Language Switch Bar */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-stone-300 font-medium">Switch Track:</span>
              <div className="inline-flex p-1 bg-black/20 rounded-xl backdrop-blur-xs">
                <button
                  onClick={() => setActiveLanguage('ibibio')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeLanguage === 'ibibio'
                      ? 'bg-amber-400 text-stone-900 shadow-xs'
                      : 'text-stone-200 hover:text-white'
                  }`}
                >
                  Ibibio Track
                </button>
                <button
                  onClick={() => setActiveLanguage('efik')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeLanguage === 'efik'
                      ? 'bg-amber-400 text-stone-900 shadow-xs'
                      : 'text-stone-200 hover:text-white'
                  }`}
                >
                  Efik Track
                </button>
              </div>
            </div>
          </div>

          {/* Quick Continue Lesson Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl w-full lg:w-80 space-y-3">
            <div className="flex items-center justify-between text-xs text-amber-200 font-semibold">
              <span>{isAllFinished ? 'Track Status' : 'Next Recommended'}</span>
              <span className="uppercase text-emerald-300">
                {isAllFinished ? '100% Mastered' : nextLesson ? `Module ${nextLesson.module_number}` : ''}
              </span>
            </div>
            <div>
              <h4 className="text-base font-bold text-white font-display line-clamp-1">
                {isAllFinished ? 'All 7 Modules Completed! 🏆' : nextLesson?.title || 'First Greetings'}
              </h4>
              <p className="text-xs text-stone-200 italic line-clamp-1">
                {isAllFinished ? 'Sosọñọ eti-eti! Heritage Scholar' : nextLesson?.indigenous_title}
              </p>
            </div>
            {isAllFinished ? (
              <button
                onClick={() => {
                  triggerCourseCompletionFireworks();
                  playLessonCompleteFanfare();
                }}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-stone-900 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                <PartyPopper className="w-3.5 h-3.5" />
                <span>Celebrate Completion 🎉</span>
              </button>
            ) : nextLesson ? (
              <button
                onClick={() => {
                  if (user) {
                    onStartLesson(nextLesson);
                  } else {
                    openAuthModal();
                  }
                }}
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{user ? 'Start Next Lesson' : 'Sign in to Start'}</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Streak Celebration Banner (When streak is active) */}
      {user && user.current_streak > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-emerald-500/10 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-md transition-transform ${isCelebrating ? 'scale-115 rotate-6' : 'animate-bounce'}`}>
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-stone-900">
                  {user.current_streak >= (user.longest_streak || 1)
                    ? `🔥 New All-Time Record: ${user.current_streak}-Day Streak!`
                    : `🔥 ${user.current_streak}-Day Streak Maintained!`}
                </h3>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Keep it going!
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Sosongo! Your daily dedication preserves the Ibibio and Efik indigenous heritage.
              </p>
            </div>
          </div>
          <button
            onClick={handleCelebrateStreak}
            disabled={isCelebrating}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <PartyPopper className={`w-4 h-4 ${isCelebrating ? 'animate-spin' : ''}`} />
            <span>{isCelebrating ? 'Fanfare Playing! 🎉' : 'Celebrate Streak 🎉'}</span>
          </button>
        </div>
      )}

      {/* Gamification Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div
          onClick={handleCelebrateStreak}
          title="Click to celebrate your streak!"
          className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2 cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 group-hover:text-amber-700 transition-colors">Day Streak</span>
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 tabular-nums">
              {user?.current_streak || 0}
            </span>
            <span className="text-xs text-stone-400 ml-1">days</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-stone-500">
              Longest: <span className="font-bold tabular-nums text-stone-700">{user?.longest_streak || 0} days</span>
            </p>
            <span className="text-[10px] text-amber-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              Tap for 🎉
            </span>
          </div>
        </div>

        {/* Total XP */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Total XP</span>
            <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 tabular-nums">
              {user?.total_xp || 0}
            </span>
            <span className="text-xs text-stone-400 ml-1">XP</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Earned through lessons
          </p>
        </div>

        {/* Daily Goal */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Daily Goal</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 tabular-nums">
              {user?.daily_xp_today || 0}
            </span>
            <span className="text-xs text-stone-400 ml-1">/ {user?.daily_goal || 50} XP</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${dailyGoalPercent}%` }}
            />
          </div>
        </div>

        {/* Course Progress */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Course Progress</span>
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 tabular-nums">
              {coursePercent}%
            </span>
            <span className="text-xs text-stone-400 ml-1">
              ({completedCount}/{lessons.length})
            </span>
          </div>
          <p className="text-[11px] text-stone-500">
            7 thematic modules
          </p>
        </div>
      </div>

      {/* Main Grid: Interactive Lesson Path & Achievements Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Duolingo-style Lesson Path */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-display">
                Curriculum Learning Pathway
              </h2>
              <p className="text-xs text-stone-500">
                Complete modules in sequence to unlock advanced conversation skills.
              </p>
            </div>
          </div>

          {/* All Modules Complete Grand Showcase Banner */}
          {isAllFinished && (
            <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-amber-500/15 border-2 border-amber-400/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shrink-0 animate-bounce">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-extrabold text-stone-900 font-display">
                        🎉 All Modules Completed!
                      </h3>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        7 / 7 Mastered
                      </span>
                    </div>
                    {/* Exact user requested message verbatim */}
                    <p className="text-xs sm:text-sm text-stone-800 font-bold mt-1">
                      We&apos;re working on bringing more modules for you! Stay Tuned and Invite your family and loved ones
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    triggerCourseCompletionFireworks();
                    playLessonCompleteFanfare();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 shrink-0 hover:scale-105 active:scale-95"
                >
                  <PartyPopper className="w-4 h-4" />
                  <span>Celebrate Again 🎉</span>
                </button>
              </div>
            </div>
          )}

          {/* Lessons List */}
          <div className="space-y-4">
            {lessons.map((lesson, idx) => {
              const isUnlocked = Boolean(lesson.is_unlocked || idx === 0);
              const isCompleted = Boolean(lesson.is_completed);

              return (
                <div
                  key={lesson.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCompleted
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                      : isUnlocked
                      ? 'bg-white border-stone-200 hover:border-emerald-600/50 shadow-xs hover:shadow-md'
                      : 'bg-stone-50/60 border-stone-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Circle Node Icon */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
                        isCompleted
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : isUnlocked
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : isUnlocked ? (
                        <span className="text-lg tabular-nums">{lesson.module_number}</span>
                      ) : (
                        <Lock className="w-5 h-5 text-stone-400" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                          Module {lesson.module_number} · {lesson.difficulty}
                        </span>
                        {isCompleted && (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Score: {lesson.score || 100}%
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-stone-900 font-display">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-emerald-800 font-semibold italic">
                        &quot;{lesson.indigenous_title}&quot;
                      </p>
                      <p className="text-xs text-stone-500 leading-relaxed max-w-md">
                        {lesson.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0 sm:self-center">
                    {isCompleted ? (
                      <button
                        onClick={() => {
                          if (user) onStartLesson(lesson);
                          else openAuthModal();
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Practice Again</span>
                      </button>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => {
                          if (user) onStartLesson(lesson);
                          else openAuthModal();
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Lesson (+{lesson.xp_reward} XP)</span>
                      </button>
                    ) : (
                      <div className="px-4 py-2 text-stone-400 text-xs font-semibold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (4 cols): Achievements & Badges Showcase */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold text-stone-900 font-display">
                  Achievements &amp; Badges
                </h3>
              </div>
              <span className="text-xs text-stone-500 tabular-nums">
                {achievements.filter((a) => a.is_unlocked).length} / {achievements.length}
              </span>
            </div>

            <div className="space-y-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                    ach.is_unlocked
                      ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                      : 'bg-stone-50 border-stone-200 opacity-50'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                      ach.is_unlocked
                        ? 'bg-amber-400 text-stone-900 shadow-xs'
                        : 'bg-stone-200 text-stone-400'
                    }`}
                  >
                    {ach.is_unlocked ? '🏆' : '🔒'}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-stone-900">{ach.title}</h4>
                      {ach.is_unlocked && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 italic">{ach.indigenous_title}</p>
                    <p className="text-[11px] text-stone-600 leading-snug">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
