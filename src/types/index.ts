export type LanguageCode = 'ibibio' | 'efik';

export type ProficiencyLevel = 'beginner' | 'basic' | 'intermediate';

export interface User {
  id: string;
  display_name: string;
  email: string;
  selected_language: LanguageCode;
  proficiency_level: ProficiencyLevel;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  daily_goal: number; // e.g. 30, 50, 100 XP
  daily_xp_today: number;
  last_activity_date: string; // YYYY-MM-DD
  activity_dates: string[]; // List of YYYY-MM-DD
  notification_preferences: {
    daily_reminder: boolean;
    reminder_time: string; // "19:00"
    streak_freeze_alerts: boolean;
    browser_notifications: boolean;
  };
  created_at: string;
}

export interface DictionaryEntry {
  id: string;
  word: string;
  phonetic: string;
  language: LanguageCode;
  translation: string;
  definition: string;
  category: 'greetings' | 'family' | 'numbers' | 'food' | 'expressions' | 'questions' | 'nature' | 'verbs';
  example_sentence: string;
  example_translation: string;
  tone_notes: string;
  pronunciation_url?: string;
  verification_status: 'verified' | 'community_reviewed' | 'unverified';
}

export type ExerciseType = 
  | 'multiple_choice' 
  | 'word_match' 
  | 'fill_blank' 
  | 'sentence_reorder' 
  | 'listening';

export interface Exercise {
  id: string;
  lesson_id: string;
  exercise_type: ExerciseType;
  prompt: string;
  context?: string;
  audio_text?: string;
  options?: string[];
  correct_answer: string | string[];
  pairs?: { indigenous: string; english: string }[];
  scrambled_words?: string[];
  blank_sentence?: string;
  explanation: string;
}

export interface Lesson {
  id: string;
  language: LanguageCode;
  title: string;
  indigenous_title: string;
  description: string;
  module_number: number;
  module_name: string;
  difficulty: ProficiencyLevel;
  order: number;
  xp_reward: number;
  exercises: Exercise[];
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  score: number;
  xp_earned: number;
  completed_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  indigenous_title: string;
  description: string;
  xp_requirement?: number;
  streak_requirement?: number;
  lessons_requirement?: number;
  badge_icon: string;
  category: 'xp' | 'streak' | 'lessons' | 'special';
}

export interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
}

export interface AiExplanationResponse {
  query: string;
  language: LanguageCode;
  etymology: string;
  cultural_context: string;
  tonal_guide: string;
  cognate_comparison: string;
  disclaimer: string;
}
