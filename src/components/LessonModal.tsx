import React, { useState } from 'react';
import { Lesson, Exercise } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  playIndigenousTone,
  playSuccessChime,
  playMistakeChime,
  playLessonCompleteFanfare,
} from '../utils/audio';
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
} from 'lucide-react';

interface LessonModalProps {
  lesson: Lesson;
  onClose: () => void;
  onLessonCompleted: (earnedXp: number, newAchievements: string[]) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  onClose,
  onLessonCompleted,
}) => {
  const { token, refreshUser } = useAuth();
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

  // Multiple Choice / Fill blank selection
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Sentence reorder builder state
  const [sentenceTokens, setSentenceTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);

  // Word match state
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  const currentExercise: Exercise = lesson.exercises[currentExerciseIndex];

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
  }, [currentExerciseIndex]);

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

    if (currentExercise.exercise_type === 'multiple_choice' || currentExercise.exercise_type === 'fill_blank' || currentExercise.exercise_type === 'listening') {
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
    if (currentExerciseIndex < lesson.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    } else {
      // Completed all questions in the lesson
      const finalAccuracy = Math.round((stats.correctCount / Math.max(stats.totalAnswered, 1)) * 100);

      try {
        if (token) {
          const res = await fetch('/api/lessons/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              lesson_id: lesson.id,
              score: finalAccuracy,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setStats((prev) => ({
              ...prev,
              earnedXp: data.earned_xp,
              newAchievements: data.new_achievements || [],
            }));
            await refreshUser();
          }
        }
      } catch (err) {
        console.error('Failed to save completion:', err);
      }

      playLessonCompleteFanfare();
      setIsCompleted(true);
    }
  };

  const progressPercent = Math.round(
    ((currentExerciseIndex + (feedbackStatus === 'correct' ? 1 : 0)) / lesson.exercises.length) * 100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/75 backdrop-blur-xs">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-2xl w-full h-[90vh] max-h-[720px] flex flex-col overflow-hidden shadow-2xl border border-stone-200">
        {/* Top Header bar with progress */}
        <div className="p-4 sm:p-6 border-b border-stone-200/80 bg-white flex items-center justify-between gap-4 shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            aria-label="Exit lesson"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Duolingo-style Progress Bar */}
          <div className="flex-1 bg-stone-100 h-3 rounded-full overflow-hidden border border-stone-200/60">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>+{lesson.xp_reward} XP</span>
          </div>
        </div>

        {/* Lesson Body: Interactive Exercise Stage */}
        {!isCompleted ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col justify-center max-w-xl mx-auto w-full">
            {/* Exercise Category & Prompt */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {lesson.module_name} · Exercise {currentExerciseIndex + 1} of {lesson.exercises.length}
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
        ) : (
          /* Lesson Complete Celebration Screen */
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center animate-bounce shadow-md">
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Lesson Complete!
              </span>
              <h2 className="text-3xl font-extrabold text-stone-900 font-display">
                Sosọñọ! Outstanding Work!
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md">
                You took another vital step in keeping our indigenous Nigerian mother tongue vibrant and thriving.
              </p>
            </div>

            {/* Results Metric Strip */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
              <div className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs">
                <span className="text-xs text-stone-400 font-medium">XP Earned</span>
                <p className="text-xl font-extrabold text-amber-600 tabular-nums">
                  +{stats.earnedXp || lesson.xp_reward}
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
                  {lesson.exercises.length}
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

            <button
              onClick={() => {
                onLessonCompleted(stats.earnedXp || lesson.xp_reward, stats.newAchievements);
                onClose();
              }}
              className="w-full max-w-sm py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl transition-all shadow-md cursor-pointer"
            >
              Continue Learning
            </button>
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
