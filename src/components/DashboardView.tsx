import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lesson, Achievement, LanguageCode } from '../types';
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
} from 'lucide-react';

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

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch lessons
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [lessonsRes, achRes] = await Promise.all([
        fetch(`/api/lessons?language=${activeLanguage}`, { headers }),
        fetch('/api/achievements', { headers }),
      ]);

      if (lessonsRes.ok) {
        const lData = await lessonsRes.json();
        setLessons(lData.lessons);
      }
      if (achRes.ok) {
        const aData = await achRes.json();
        setAchievements(aData.achievements);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeLanguage, token]);

  const completedCount = lessons.filter((l) => l.is_completed).length;
  const coursePercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                {activeLanguage === 'ibibio' ? 'Ibibio Learning Academy' : 'Efik Learning Academy'}
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-200 capitalize">
                Level: {user?.proficiency_level || 'Beginner'}
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
              <span>Next Recommended</span>
              <span className="uppercase">{nextLesson ? `Module ${nextLesson.module_number}` : ''}</span>
            </div>
            <div>
              <h4 className="text-base font-bold text-white font-display line-clamp-1">
                {nextLesson?.title || 'First Greetings'}
              </h4>
              <p className="text-xs text-stone-200 italic line-clamp-1">
                {nextLesson?.indigenous_title}
              </p>
            </div>
            {nextLesson && (
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
            )}
          </div>
        </div>
      </div>

      {/* Gamification Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Day Streak</span>
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 tabular-nums">
              {user?.current_streak || 0}
            </span>
            <span className="text-xs text-stone-400 ml-1">days</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Longest: <span className="font-bold tabular-nums text-stone-700">{user?.longest_streak || 0} days</span>
          </p>
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
