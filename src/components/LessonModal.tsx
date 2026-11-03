import React, { useState, useEffect, useMemo } from 'react';
import { Lesson, Exercise } from '../types';
import { useAuth } from '../context/AuthContext';
import { LESSONS_DATABASE } from '../data/seedData';
import { recordLessonCompletion } from '../utils/progress';
import {
  playIndigenousTone,
  playSuccessChime,
  playMistakeChime,
  playLessonCompleteFanfare,
} from '../utils/audio';
import { triggerCelebrationConfetti, triggerCourseCompletionFireworks } from '../utils/confetti';
import {
  X,
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Award,
  RotateCcw,
  Flame,
  Check,
  Trophy,
  PartyPopper,
  BookOpen,
} from 'lucide-react';

interface LessonModalProps {
  lesson: Lesson;
  onClose: () => void;
  onLessonCompleted: (earnedXp: number, newAchievements: string[]) => void;
  onStartNextLesson?: (nextLesson: Lesson) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  onClose,
  onLessonCompleted,
  onStartNextLesson,
}) => {
  const { token, refreshUser, setUser } = useAuth();
  const [currentLesson, setCurrentLesson] = useState<Lesson>(lesson);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [isCompleted, setIsCompleted] = useState(false);
  const [stats, setStats] = useState({
    correctCount: 0,
    totalAnswered: 0,
    earnedXp: 0,
    newAchievements: [] as string[],
  });

  // Keep currentLesson in sync if prop changes
  useEffect(() => {
    setCurrentLesson(lesson);
  }, [lesson]);

  // Track all lessons in this curriculum track
  const trackLessons = useMemo(() => {
    return LESSONS_DATABASE.filter((l) => l.language === currentLesson.language).sort(
      (a, b) => a.order - b.order
    );
  }, [currentLesson.language]);

  const currentModuleIdx = trackLessons.findIndex((l) => l.id === currentLesson.id);
  const nextLesson =
    currentModuleIdx >= 0 && currentModuleIdx < trackLessons.length - 1
      ? trackLessons[currentModuleIdx + 1]
      : null;
  const isFinalModule = !nextLesson;

  // Multiple Choice / Fill blank selection
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Sentence reorder builder state
  const [sentenceTokens, setSentenceTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);

  // Word match state
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  const currentExercise: Exercise = currentLesson.exercises[currentExerciseIndex] || currentLesson.exercises[0];

  // Initialize exercise state when moving to a new exercise
  React.useEffect(() => {
    setFeedbackStatus('idle');
    setSelectedOption(null);

    if (currentExercise.exercise_type === 'sentence_reorder' && currentExercise.scrambled_words) {
      setSentenceTokens([]);
      setAvailableTokens([...currentExercise.scrambled_words]);
    }

    if (currentExercise.exercise_type === 'word_match') {
      setMatchedPairs([]);
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  }, [currentExerciseIndex, currentLesson.id]);

  const handlePlayAudio = (text?: string) => {
    const toPlay = text || currentExercise.audio_text || currentExercise.prompt;
    playIndigenousTone(toPlay);
  };

  // --- Handlers for Exercise Types ---

  // Sentence reorder handlers
  const handleSelectToken = (tokenStr: string, index: number) => {
    if (feedbackStatus !== 'idle') return;
    setSentenceTokens([...sentenceTokens, tokenStr]);
    const updated = [...availableTokens];
    updated.splice(index, 1);
    setAvailableTokens(updated);
  };

  const handleRemoveToken = (tokenStr: string, index: number) => {
    if (feedbackStatus !== 'idle') return;
    const updatedTokens = [...sentenceTokens];
    updatedTokens.splice(index, 1);
    setSentenceTokens(updatedTokens);
    setAvailableTokens([...availableTokens, tokenStr]);
  };

  // Word match handler
  const handleMatchSelect = (type: 'left' | 'right', value: string) => {
    if (feedbackStatus !== 'idle' || matchedPairs.includes(value)) return;

    if (type === 'left') {
      setSelectedLeft(value);
      if (selectedRight) {
        checkPair(value, selectedRight);
      }
    } else {
      setSelectedRight(value);
      if (selectedLeft) {
        checkPair(selectedLeft, value);
      }
    }
  };

  const checkPair = (leftVal: string, rightVal: string) => {
    const pairs = currentExercise.pairs || [];
    const isPairMatch = pairs.some(
      (p) => p.indigenous === leftVal && p.english === rightVal
    );

    if (isPairMatch) {
      playSuccessChime();
      setMatchedPairs([...matchedPairs, leftVal, rightVal]);
    } else {
      playMistakeChime();
    }
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  // Check Answer Handler
  const handleCheckAnswer = () => {
    let isCorrect = false;

    if (
      currentExercise.exercise_type === 'multiple_choice' ||
      currentExercise.exercise_type === 'fill_blank' ||
      currentExercise.exercise_type === 'listening'
    ) {
      isCorrect = selectedOption === currentExercise.correct_answer;
    } else if (currentExercise.exercise_type === 'sentence_reorder') {
      const correctArr = Array.isArray(currentExercise.correct_answer)
        ? currentExercise.correct_answer
        : [currentExercise.correct_answer];
      isCorrect =
        sentenceTokens.length === correctArr.length &&
        sentenceTokens.every((val, idx) => val === correctArr[idx]);
    } else if (currentExercise.exercise_type === 'word_match') {
      const pairs = currentExercise.pairs || [];
      isCorrect = matchedPairs.length === pairs.length * 2;
    }

    if (isCorrect) {
      playSuccessChime();
      setFeedbackStatus('correct');
      setStats((prev) => ({
        ...prev,
        correctCount: prev.correctCount + 1,
        totalAnswered: prev.totalAnswered + 1,
      }));
    } else {
      playMistakeChime();
      setFeedbackStatus('incorrect');
      setStats((prev) => ({
        ...prev,
        totalAnswered: prev.totalAnswered + 1,
      }));
    }
  };

  // Continue to Next Exercise or Complete
  const handleContinue = async () => {
    if (currentExerciseIndex < currentLesson.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    } else {
      // Completed all questions in the lesson
      const finalAccuracy = Math.round(
        (stats.correctCount / Math.max(stats.totalAnswered, 1)) * 100
      );
      const earnedXp = Math.max(
        Math.round((currentLesson.xp_reward * Math.min(finalAccuracy, 100)) / 100),
        10
      );
      const todayStr = new Date().toISOString().split('T')[0];

      // Optimistically increment state immediately so dashboard updates in real-time
      setUser((prev) => {
        if (!prev) return null;
        const newTotal = (prev.total_xp || 0) + earnedXp;
        const newDaily =
          (prev.last_activity_date === todayStr ? prev.daily_xp_today || 0 : 0) + earnedXp;
        let newStreak = prev.current_streak || 0;
        if (!prev.last_activity_date) {
          newStreak = 1;
        } else if (prev.last_activity_date !== todayStr) {
          const diff = Math.round(
            (new Date(todayStr).getTime() - new Date(prev.last_activity_date).getTime()) /
              86400000
          );
          newStreak = diff === 1 ? newStreak + 1 : 1;
        }
        return {
          ...prev,
          total_xp: newTotal,
          daily_xp_today: newDaily,
          current_streak: newStreak,
          longest_streak: Math.max(prev.longest_streak || 0, newStreak),
          last_activity_date: todayStr,
        };
      });

      // Persist to Firestore, Express backend, and LocalStorage
      try {
        const result = await recordLessonCompletion({
          lesson: currentLesson,
          score: finalAccuracy,
          earnedXp,
          token,
        });

        setStats((prev) => ({
          ...prev,
          earnedXp: result.earnedXp || earnedXp,
          newAchievements: result.newAchievements || [],
        }));
      } catch (err) {
        console.error('Failed to save completion:', err);
      }

      // Check if all modules in course are completed
      if (isFinalModule) {
        triggerCourseCompletionFireworks();
        playLessonCompleteFanfare();
      } else {
        triggerCelebrationConfetti();
        playLessonCompleteFanfare();
      }

      setIsCompleted(true);
    }
  };

  // Seamlessly transition directly to the next unlocked module
  const handleProceedToNextModule = () => {
    if (!nextLesson) return;
    onLessonCompleted(stats.earnedXp || currentLesson.xp_reward, stats.newAchievements);
    if (onStartNextLesson) {
      onStartNextLesson(nextLesson);
    }
    setCurrentLesson(nextLesson);
    setCurrentExerciseIndex(0);
    setUserAnswers({});
    setFeedbackStatus('idle');
    setIsCompleted(false);
    setSelectedOption(null);
    setSentenceTokens([]);
    setAvailableTokens([]);
    setMatchedPairs([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setStats({
      correctCount: 0,
      totalAnswered: 0,
      earnedXp: 0,
      newAchievements: [],
    });
  };

  const progressPercent = Math.round(
    ((currentExerciseIndex + (feedbackStatus === 'correct' ? 1 : 0)) / lesson.exercises.length) * 100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-900/75 backdrop-blur-xs overscroll-contain">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-2xl w-full h-[calc(100dvh-1rem)] sm:h-[min(90dvh,720px)] max-h-[720px] flex flex-col overflow-hidden shadow-2xl border border-stone-200">
        {/* Top Header bar with progress */}
        <div className="p-3.5 sm:p-5 border-b border-stone-200/80 bg-white flex items-center justify-between gap-3 sm:gap-4 shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            aria-label="Exit lesson"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Duolingo-style Progress Bar */}
          <div className="flex-1 bg-stone-100 h-2.5 sm:h-3 rounded-full overflow-hidden border border-stone-200/60">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60 shrink-0">
            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>+{currentLesson.xp_reward} XP</span>
          </div>
        </div>

        {/* Lesson Body: Interactive Exercise Stage */}
        {!isCompleted ? (
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-8 flex flex-col justify-start sm:justify-center max-w-xl mx-auto w-full">
            {/* Exercise Category & Prompt */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {currentLesson.module_name} · Exercise {currentExerciseIndex + 1} of {currentLesson.exercises.length}
                </span>
                <span className="text-xs font-medium text-stone-400 capitalize">
                  {currentExercise.exercise_type.replace('_', ' ')}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight font-display leading-snug">
                {currentExercise.prompt}
              </h2>

              {/* Audio button for listening / speech exercises */}
              {(currentExercise.exercise_type === 'listening' || currentExercise.audio_text) && (
                <div className="pt-2">
                  <button
                    onClick={() => handlePlayAudio(currentExercise.audio_text)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    <Volume2 className="w-4 h-4 text-amber-700" />
                    <span>Listen to Indigenous Tone &amp; Cadence</span>
                  </button>
                </div>
              )}
            </div>

            {/* 1. Multiple Choice / Fill Blank Options */}
            {(currentExercise.exercise_type === 'multiple_choice' ||
              currentExercise.exercise_type === 'fill_blank' ||
              currentExercise.exercise_type === 'listening') && (
              <div className="space-y-3">
                {currentExercise.blank_sentence && (
                  <div className="p-4 bg-white rounded-2xl border border-stone-200 text-center text-lg font-bold text-stone-800 mb-4 shadow-xs">
                    {currentExercise.blank_sentence.replace('___', selectedOption ? `[ ${selectedOption} ]` : '_______')}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2.5">
                  {currentExercise.options?.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (feedbackStatus === 'idle') setSelectedOption(option);
                        }}
                        disabled={feedbackStatus !== 'idle'}
                        className={`w-full p-4 rounded-2xl text-left font-bold text-sm sm:text-base border-2 transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-xs'
                            : 'bg-white border-stone-200/90 text-stone-800 hover:border-emerald-600/50 hover:bg-stone-50'
                        }`}
                      >
                        <span>{option}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-700" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Sentence Reorder / Construction */}
            {currentExercise.exercise_type === 'sentence_reorder' && (
              <div className="space-y-6">
                {/* Assembled Sentence Target Slot */}
                <div className="min-h-24 p-4 bg-white rounded-2xl border-2 border-dashed border-stone-300 flex flex-wrap gap-2 items-center">
                  {sentenceTokens.length === 0 ? (
                    <span className="text-xs text-stone-400 font-medium">
                      Tap the word chips below in the correct order to construct the sentence.
                    </span>
                  ) : (
                    sentenceTokens.map((tokenStr, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleRemoveToken(tokenStr, idx)}
                        disabled={feedbackStatus !== 'idle'}
                        className="px-3.5 py-2 bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs hover:bg-emerald-800 transition-all cursor-pointer"
                      >
                        {tokenStr}
                      </button>
                    ))
                  )}
                </div>

                {/* Available Word Chips Bank */}
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  {availableTokens.map((tokenStr, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectToken(tokenStr, idx)}
                      disabled={feedbackStatus !== 'idle'}
                      className="px-4 py-2 bg-white border border-stone-200 text-stone-800 font-bold text-sm rounded-xl shadow-xs hover:bg-stone-100 transition-all cursor-pointer"
                    >
                      {tokenStr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Word Matching Pairs */}
            {currentExercise.exercise_type === 'word_match' && (
              <div className="space-y-4">
                <p className="text-xs text-stone-500 text-center">
                  Tap an indigenous word on the left, then tap its matching translation on the right.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column: Indigenous */}
                  <div className="space-y-2">
                    {currentExercise.pairs?.map((p, i) => {
                      const isMatched = matchedPairs.includes(p.indigenous);
                      const isSelected = selectedLeft === p.indigenous;
                      return (
                        <button
                          key={i}
                          onClick={() => handleMatchSelect('left', p.indigenous)}
                          disabled={isMatched || feedbackStatus !== 'idle'}
                          className={`w-full p-3 rounded-xl text-left font-bold text-xs sm:text-sm border-2 transition-all cursor-pointer ${
                            isMatched
                              ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-default opacity-50'
                              : isSelected
                              ? 'bg-amber-100 border-amber-600 text-amber-950 shadow-xs'
                              : 'bg-white border-stone-200 text-stone-800 hover:border-amber-500'
                          }`}
                        >
                          {p.indigenous}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column: English (Scrambled) */}
                  <div className="space-y-2">
                    {[...(currentExercise.pairs || [])]
                      .reverse()
                      .map((p, i) => {
                        const isMatched = matchedPairs.includes(p.english);
                        const isSelected = selectedRight === p.english;
                        return (
                          <button
                            key={i}
                            onClick={() => handleMatchSelect('right', p.english)}
                            disabled={isMatched || feedbackStatus !== 'idle'}
                            className={`w-full p-3 rounded-xl text-left font-bold text-xs sm:text-sm border-2 transition-all cursor-pointer ${
                              isMatched
                                ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-default opacity-50'
                                : isSelected
                                ? 'bg-amber-100 border-amber-600 text-amber-950 shadow-xs'
                                : 'bg-white border-stone-200 text-stone-800 hover:border-amber-500'
                            }`}
                          >
                            {p.english}
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : isFinalModule ? (
          /* ALL MODULES FINISHED CELEBRATION SCREEN WITH CONFETTI */
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center shadow-xl animate-bounce">
                <Trophy className="w-12 h-12 text-amber-950" />
              </div>
              <span className="absolute -top-2 -right-2 bg-emerald-600 text-white p-2 rounded-full shadow-lg">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-2 max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-extrabold uppercase tracking-wider border border-amber-300">
                <PartyPopper className="w-3.5 h-3.5" />
                <span>All {trackLessons.length} Modules Mastered!</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 font-display leading-tight">
                Sosọñọ Akamba! Course Complete!
              </h2>
              {/* Exact user requested notice verbatim */}
              <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 text-amber-950 shadow-sm mt-3">
                <p className="text-sm sm:text-base font-bold leading-relaxed">
                  We&apos;re working on bringing more modules for you! Stay Tuned and Invite your family and loved ones
                </p>
              </div>
            </div>

            {/* Final Results Metric Strip */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-sm">
              <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs">
                <span className="text-[11px] text-stone-400 font-medium">XP Earned</span>
                <p className="text-lg sm:text-xl font-extrabold text-amber-600 tabular-nums">
                  +{stats.earnedXp || currentLesson.xp_reward}
                </p>
              </div>

              <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs">
                <span className="text-[11px] text-stone-400 font-medium">Accuracy</span>
                <p className="text-lg sm:text-xl font-extrabold text-emerald-700 tabular-nums">
                  {Math.round((stats.correctCount / Math.max(stats.totalAnswered, 1)) * 100)}%
                </p>
              </div>

              <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs">
                <span className="text-[11px] text-stone-400 font-medium">Course</span>
                <p className="text-lg sm:text-xl font-extrabold text-emerald-700 tabular-nums">
                  100%
                </p>
              </div>
            </div>

            {/* New Achievements notification */}
            {stats.newAchievements.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 w-full max-w-sm text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Achievement Unlocked!</span>
                </div>
                {stats.newAchievements.map((achTitle, i) => (
                  <p key={i} className="text-xs text-amber-800 font-semibold">
                    🏆 {achTitle}
                  </p>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full max-w-sm space-y-2.5">
              <button
                onClick={() => {
                  triggerCourseCompletionFireworks();
                  playLessonCompleteFanfare();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <PartyPopper className="w-4 h-4" />
                <span>Celebrate Again 🎉</span>
              </button>

              <button
                onClick={() => {
                  onLessonCompleted(stats.earnedXp || currentLesson.xp_reward, stats.newAchievements);
                  onClose();
                }}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm rounded-2xl transition-all cursor-pointer"
              >
                Return to Dashboard &amp; Pathway
              </button>
            </div>
          </div>
        ) : (
          /* STANDARD MODULE COMPLETE CELEBRATION SCREEN WITH NEXT MODULE ACTION */
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-md animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Module {currentLesson.module_number} Complete!
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
                Sosọñọ! Outstanding Work!
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md">
                You have successfully unlocked{' '}
                <span className="font-bold text-emerald-800">
                  Module {nextLesson?.module_number}: {nextLesson?.title}
                </span>
                . Ready to proceed?
              </p>
            </div>

            {/* Results Metric Strip */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
              <div className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs">
                <span className="text-xs text-stone-400 font-medium">XP Earned</span>
                <p className="text-xl font-extrabold text-amber-600 tabular-nums">
                  +{stats.earnedXp || currentLesson.xp_reward}
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs">
                <span className="text-xs text-stone-400 font-medium">Accuracy</span>
                <p className="text-xl font-extrabold text-emerald-700 tabular-nums">
                  {Math.round((stats.correctCount / Math.max(stats.totalAnswered, 1)) * 100)}%
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs">
                <span className="text-xs text-stone-400 font-medium">Questions</span>
                <p className="text-xl font-extrabold text-stone-800 tabular-nums">
                  {currentLesson.exercises.length}
                </p>
              </div>
            </div>

            {/* New Achievements notification */}
            {stats.newAchievements.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 w-full max-w-sm text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Achievement Unlocked!</span>
                </div>
                {stats.newAchievements.map((achTitle, i) => (
                  <p key={i} className="text-xs text-amber-800 font-semibold">
                    🏆 {achTitle}
                  </p>
                ))}
              </div>
            )}

            {/* Action Buttons: Proceed to Next Module OR Back to Pathway */}
            <div className="w-full max-w-sm space-y-2.5">
              {nextLesson && (
                <button
                  onClick={handleProceedToNextModule}
                  className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>
                    Proceed to Module {nextLesson.module_number}: {nextLesson.title}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => {
                  onLessonCompleted(stats.earnedXp || currentLesson.xp_reward, stats.newAchievements);
                  onClose();
                }}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm rounded-2xl transition-all cursor-pointer"
              >
                Back to Curriculum Pathway
              </button>
            </div>
          </div>
        )}

        {/* Bottom Action / Feedback Drawer */}
        {!isCompleted && (
          <div
            className={`p-4 sm:p-6 border-t transition-all shrink-0 ${
              feedbackStatus === 'correct'
                ? 'bg-emerald-100 border-emerald-300'
                : feedbackStatus === 'incorrect'
                ? 'bg-rose-100 border-rose-300'
                : 'bg-white border-stone-200'
            }`}
          >
            <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
              {feedbackStatus === 'idle' ? (
                <>
                  <div className="text-xs text-stone-500 font-medium">
                    {currentExercise.exercise_type === 'sentence_reorder' && sentenceTokens.length === 0
                      ? 'Tap word chips to construct sentence'
                      : 'Choose your answer and check'}
                  </div>
                  <button
                    onClick={handleCheckAnswer}
                    disabled={
                      (currentExercise.exercise_type === 'multiple_choice' ||
                        currentExercise.exercise_type === 'fill_blank' ||
                        currentExercise.exercise_type === 'listening') &&
                      !selectedOption
                    }
                    className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
                  >
                    Check Answer
                  </button>
                </>
              ) : feedbackStatus === 'correct' ? (
                <>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-sm sm:text-base">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      <span>Eti-eti! Correct!</span>
                    </div>
                    <p className="text-xs text-emerald-800">{currentExercise.explanation}</p>
                  </div>
                  <button
                    onClick={handleContinue}
                    className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-rose-900 font-bold text-sm sm:text-base">
                      <XCircle className="w-5 h-5 text-rose-700" />
                      <span>Try again:</span>
                    </div>
                    <p className="text-xs text-rose-800 leading-snug">{currentExercise.explanation}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setFeedbackStatus('idle')}
                      className="px-3.5 py-3 bg-white text-stone-700 hover:bg-stone-100 font-bold text-xs rounded-xl border border-stone-300 transition-all cursor-pointer"
                    >
                      Retry
                    </button>
                    <button
                      onClick={handleContinue}
                      className="px-4 py-3 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      Skip
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
