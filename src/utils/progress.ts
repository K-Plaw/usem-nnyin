import { db, auth } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, getDoc } from 'firebase/firestore';
import { apiUrl } from '../lib/api';
import { Lesson } from '../types';

export interface CompletedLessonRecord {
  lesson_id: string;
  completed: boolean;
  score: number;
  xp_earned: number;
  completed_at: string;
}

const LOCAL_PROGRESS_KEY = 'usem_completed_lessons_v2';

export function getLocalProgress(): Record<string, CompletedLessonRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn('Failed to parse local progress:', err);
    return {};
  }
}

export function saveLocalProgressRecord(record: CompletedLessonRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalProgress();
    current[record.lesson_id] = record;
    localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('Failed to save local progress:', err);
  }
}

/**
 * Loads completed lesson IDs across Firestore, localStorage, and API
 */
export async function getCompletedLessonIds(userId?: string | null): Promise<Set<string>> {
  const completedIds = new Set<string>();

  // 1. Load from localStorage cache
  const local = getLocalProgress();
  Object.keys(local).forEach((id) => {
    if (local[id]?.completed) {
      completedIds.add(id);
    }
  });

  // 2. Load from Firebase Firestore if user is authenticated
  const uid = userId || auth.currentUser?.uid;
  if (uid) {
    try {
      const progressColRef = collection(db, 'users', uid, 'progress');
      const snap = await getDocs(progressColRef);
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.completed) {
          completedIds.add(docSnap.id);
          saveLocalProgressRecord({
            lesson_id: docSnap.id,
            completed: true,
            score: data.score || 100,
            xp_earned: data.xp_earned || 25,
            completed_at: data.completed_at || new Date().toISOString(),
          });
        }
      });
    } catch (err) {
      console.warn('Firestore progress query skipped/offline:', err);
    }
  }

  return completedIds;
}

/**
 * Enriches lessons array with completion, unlocking, and score based on completedIds
 */
export function enrichLessonsWithProgress(
  lessons: Lesson[],
  completedIds: Set<string>
): (Lesson & { is_completed: boolean; is_unlocked: boolean; score: number })[] {
  const local = getLocalProgress();

  return lessons.map((lesson, index) => {
    const isCompleted = completedIds.has(lesson.id);
    const isFirst = index === 0;
    const prevLesson = index > 0 ? lessons[index - 1] : null;
    const isPrevCompleted = prevLesson ? completedIds.has(prevLesson.id) : false;
    const isUnlocked = isFirst || isPrevCompleted;

    const record = local[lesson.id];
    const score = record?.score ?? (isCompleted ? 100 : 0);

    return {
      ...lesson,
      is_completed: isCompleted,
      is_unlocked: isUnlocked,
      score,
    };
  });
}

/**
 * Persists module completion cross-device to Firestore, LocalStorage, and Express backend API
 */
export async function recordLessonCompletion(params: {
  lesson: Lesson;
  score: number;
  earnedXp: number;
  token?: string | null;
}): Promise<{ earnedXp: number; newAchievements: string[] }> {
  const { lesson, score, earnedXp, token } = params;
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Immediately store in LocalStorage for instantaneous UI reactivity
  const record: CompletedLessonRecord = {
    lesson_id: lesson.id,
    completed: true,
    score,
    xp_earned: earnedXp,
    completed_at: new Date().toISOString(),
  };
  saveLocalProgressRecord(record);

  // Notify active UI listeners (e.g., DashboardView, Pathway)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('usem:progress-updated', {
        detail: { lessonId: lesson.id, score, earnedXp },
      })
    );
  }

  let finalAchievements: string[] = [];

  // 2. Persist to Firebase Cloud Firestore for persistent cross-device access
  if (auth.currentUser) {
    try {
      const uid = auth.currentUser.uid;
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);

      let firestoreTotalXp = earnedXp;
      let firestoreDailyXp = earnedXp;
      let firestoreStreak = 1;
      let firestoreLongest = 1;

      if (userSnap.exists()) {
        const prev = userSnap.data() as any;
        firestoreTotalXp = (prev.total_xp || 0) + earnedXp;
        firestoreDailyXp =
          (prev.last_activity_date === todayStr ? prev.daily_xp_today || 0 : 0) + earnedXp;
        firestoreStreak = prev.current_streak || 0;
        if (!prev.last_activity_date) {
          firestoreStreak = 1;
        } else if (prev.last_activity_date !== todayStr) {
          const diff = Math.round(
            (new Date(todayStr).getTime() - new Date(prev.last_activity_date).getTime()) /
              86400000
          );
          firestoreStreak = diff === 1 ? firestoreStreak + 1 : 1;
        }
        firestoreLongest = Math.max(prev.longest_streak || 0, firestoreStreak);
      }

      await setDoc(
        userDocRef,
        {
          total_xp: firestoreTotalXp,
          daily_xp_today: firestoreDailyXp,
          current_streak: firestoreStreak,
          longest_streak: firestoreLongest,
          last_activity_date: todayStr,
        },
        { merge: true }
      );

      // Save subcollection progress
      const progressDocRef = doc(db, 'users', uid, 'progress', lesson.id);
      await setDoc(
        progressDocRef,
        {
          lesson_id: lesson.id,
          completed: true,
          score,
          xp_earned: earnedXp,
          completed_at: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (fsErr) {
      console.warn('Firestore sync note:', fsErr);
    }
  }

  // 3. Persist to Backend API (/api/lessons/complete)
  try {
    const authToken = token || auth.currentUser?.uid;
    if (authToken) {
      const res = await fetch(apiUrl('/api/lessons/complete'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          lesson_id: lesson.id,
          score,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.new_achievements && Array.isArray(data.new_achievements)) {
          finalAchievements = data.new_achievements;
        }
      }
    }
  } catch (apiErr) {
    console.warn('Backend complete call note:', apiErr);
  }

  return {
    earnedXp,
    newAchievements: finalAchievements,
  };
}
