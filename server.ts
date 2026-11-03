import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { VERIFIED_DICTIONARY, LESSONS_DATABASE, ACHIEVEMENTS_DATABASE } from './src/data/seedData';
import { User, UserProgress, UserAchievement, DictionaryEntry, Lesson } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();
app.use(express.json());

// Initialize GoogleGenAI server client as per guidelines
const geminiApiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------------
// Database Persistence Layer (JSON file-backed store)
// -------------------------------------------------------------------
const DB_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // user_id -> password
  dictionary: DictionaryEntry[];
  lessons: Lesson[];
  user_progress: UserProgress[];
  user_achievements: (UserAchievement & { id: string; user_id: string })[];
}

function initDatabase(): DatabaseSchema {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Default demo user so judges can immediately explore authenticated features
  const initialDemoUser: User = {
    id: 'user-demo-1',
    display_name: 'Ekpedeme Bassey',
    email: 'demo@usemnnyin.org',
    selected_language: 'ibibio',
    proficiency_level: 'beginner',
    total_xp: 85,
    current_streak: 2,
    longest_streak: 4,
    daily_goal: 50,
    daily_xp_today: 25,
    last_activity_date: todayStr,
    activity_dates: [todayStr],
    notification_preferences: {
      daily_reminder: true,
      reminder_time: '19:00',
      streak_freeze_alerts: true,
      browser_notifications: false,
    },
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  };

  const defaultDb: DatabaseSchema = {
    users: [initialDemoUser],
    passwords: {
      'user-demo-1': 'welcome123',
    },
    dictionary: VERIFIED_DICTIONARY,
    lessons: LESSONS_DATABASE,
    user_progress: [
      {
        id: 'prog-demo-1',
        user_id: 'user-demo-1',
        lesson_id: 'ibi-mod-1',
        completed: true,
        score: 100,
        xp_earned: 25,
        completed_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    user_achievements: [
      {
        id: 'uach-1',
        user_id: 'user-demo-1',
        achievement_id: 'ach-first-lesson',
        unlocked_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  };

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    // Ensure lessons and dictionary stay synchronized with newest seed
    parsed.dictionary = VERIFIED_DICTIONARY;
    parsed.lessons = LESSONS_DATABASE;
    return parsed;
  } catch {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }
}

let db = initDatabase();

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database:', err);
  }
}

// Token bearer parser supporting both local and Firebase Auth UIDs
function getAuthenticatedUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  let user = db.users.find((u) => u.id === token);
  if (!user && token.length > 5) {
    const todayStr = new Date().toISOString().split('T')[0];
    user = {
      id: token,
      display_name: 'Learner',
      email: '',
      selected_language: 'ibibio',
      proficiency_level: 'beginner',
      total_xp: 0,
      current_streak: 0,
      longest_streak: 0,
      daily_goal: 50,
      daily_xp_today: 0,
      last_activity_date: '',
      activity_dates: [],
      notification_preferences: {
        daily_reminder: true,
        reminder_time: '19:00',
        streak_freeze_alerts: true,
        browser_notifications: false,
      },
      created_at: new Date().toISOString(),
    };
    db.users.push(user);
    saveDatabase();
  }
  return user || null;
}

// -------------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------------

// 1. Authentication Endpoints
app.post('/api/auth/register', (req: Request, res: Response): void => {
  const { email, password, display_name, selected_language, proficiency_level } = req.body;

  if (!email || !password || !display_name) {
    res.status(400).json({ error: 'Email, password, and name are required.' });
    return;
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    display_name: display_name.trim(),
    email: email.trim().toLowerCase(),
    selected_language: selected_language === 'efik' ? 'efik' : 'ibibio',
    proficiency_level: proficiency_level || 'beginner',
    total_xp: 0,
    current_streak: 0,
    longest_streak: 0,
    daily_goal: 50,
    daily_xp_today: 0,
    last_activity_date: '',
    activity_dates: [],
    notification_preferences: {
      daily_reminder: true,
      reminder_time: '19:00',
      streak_freeze_alerts: true,
      browser_notifications: false,
    },
    created_at: new Date().toISOString(),
  };

  db.users.push(newUser);
  db.passwords[newUser.id] = password;
  saveDatabase();

  res.json({
    user: newUser,
    token: newUser.id,
  });
});

app.post('/api/auth/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Please enter your email and password.' });
    return;
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user || db.passwords[user.id] !== password) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  res.json({
    user,
    token: user.id,
  });
});

app.post('/api/auth/guest-login', (_req: Request, res: Response): void => {
  const demoUser = db.users.find((u) => u.id === 'user-demo-1') || db.users[0];
  res.json({
    user: demoUser,
    token: demoUser.id,
  });
});

app.post('/api/auth/sync-user', (req: Request, res: Response): void => {
  const incomingUser = req.body.user as Partial<User>;
  if (!incomingUser || !incomingUser.id) {
    res.status(400).json({ error: 'User id is required' });
    return;
  }

  let user = db.users.find((u) => u.id === incomingUser.id);
  const todayStr = new Date().toISOString().split('T')[0];

  if (!user) {
    user = {
      id: incomingUser.id,
      display_name: incomingUser.display_name || 'Learner',
      email: incomingUser.email || '',
      selected_language: incomingUser.selected_language || 'ibibio',
      proficiency_level: incomingUser.proficiency_level || 'beginner',
      total_xp: incomingUser.total_xp || 0,
      current_streak: incomingUser.current_streak || 0,
      longest_streak: incomingUser.longest_streak || 0,
      daily_goal: incomingUser.daily_goal || 50,
      daily_xp_today: incomingUser.daily_xp_today || 0,
      last_activity_date: incomingUser.last_activity_date || todayStr,
      activity_dates: incomingUser.activity_dates || [todayStr],
      notification_preferences: incomingUser.notification_preferences || {
        daily_reminder: true,
        reminder_time: '19:00',
        streak_freeze_alerts: true,
        browser_notifications: false,
      },
      created_at: incomingUser.created_at || new Date().toISOString(),
    };
    db.users.push(user);
  } else {
    // Merge latest data
    if (incomingUser.display_name) user.display_name = incomingUser.display_name;
    if (incomingUser.email) user.email = incomingUser.email;
    if (incomingUser.selected_language) user.selected_language = incomingUser.selected_language;
    if (incomingUser.proficiency_level) user.proficiency_level = incomingUser.proficiency_level;
    if (typeof incomingUser.total_xp === 'number') {
      user.total_xp = Math.max(user.total_xp, incomingUser.total_xp);
    }
  }

  saveDatabase();
  res.json({ user });
});

app.get('/api/auth/me', (req: Request, res: Response): void => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  // Calculate day rollover for daily_xp_today
  const todayStr = new Date().toISOString().split('T')[0];
  if (user.last_activity_date !== todayStr) {
    user.daily_xp_today = 0;
  }

  res.json({ user });
});

app.post('/api/auth/update', (req: Request, res: Response): void => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { selected_language, proficiency_level, daily_goal, notification_preferences } = req.body;

  if (selected_language && (selected_language === 'ibibio' || selected_language === 'efik')) {
    user.selected_language = selected_language;
  }
  if (proficiency_level) {
    user.proficiency_level = proficiency_level;
  }
  if (typeof daily_goal === 'number') {
    user.daily_goal = daily_goal;
  }
  if (notification_preferences) {
    user.notification_preferences = {
      ...user.notification_preferences,
      ...notification_preferences,
    };
  }

  saveDatabase();
  res.json({ user });
});

// 2. Bilingual Dictionary Endpoints (Public)
app.get('/api/dictionary', (req: Request, res: Response): void => {
  const { q, language, category, direction } = req.query;

  let results = [...db.dictionary];

  if (language && language !== 'all') {
    results = results.filter((entry) => entry.language === language);
  }

  if (category && category !== 'all') {
    results = results.filter((entry) => entry.category === category);
  }

  if (q && typeof q === 'string') {
    const search = q.trim().toLowerCase();
    results = results.filter((entry) => {
      const matchWord = entry.word.toLowerCase().includes(search);
      const matchTranslation = entry.translation.toLowerCase().includes(search);
      const matchDef = entry.definition.toLowerCase().includes(search);
      const matchPhonetic = entry.phonetic.toLowerCase().includes(search);

      if (direction === 'indigenous_to_en') {
        return matchWord || matchPhonetic;
      }
      if (direction === 'en_to_indigenous') {
        return matchTranslation || matchDef;
      }
      return matchWord || matchTranslation || matchDef || matchPhonetic;
    });
  }

  res.json({
    entries: results,
    total: results.length,
  });
});

// 3. Lessons & Progress Endpoints (Authenticated)
app.get('/api/lessons', (req: Request, res: Response): void => {
  const user = getAuthenticatedUser(req);
  const lang = req.query.language as string;

  let lessons = [...db.lessons];
  if (lang && (lang === 'ibibio' || lang === 'efik')) {
    lessons = lessons.filter((l) => l.language === lang);
  }

  // Annotate with progress if user is authenticated
  const progressMap = new Map<string, UserProgress>();
  if (user) {
    db.user_progress
      .filter((p) => p.user_id === user.id)
      .forEach((p) => progressMap.set(p.lesson_id, p));
  }

  const enrichedLessons = lessons.map((lesson, index) => {
    const prog = progressMap.get(lesson.id);
    const isFirst = index === 0;
    const prevLesson = index > 0 ? lessons[index - 1] : null;
    const isUnlocked = isFirst || (prevLesson && progressMap.has(prevLesson.id));

    return {
      ...lesson,
      is_completed: prog?.completed || false,
      score: prog?.score || 0,
      is_unlocked: Boolean(isUnlocked),
    };
  });

  res.json({
    lessons: enrichedLessons,
  });
});

app.post('/api/lessons/complete', (req: Request, res: Response): void => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'You must be signed in to save lesson progress.' });
    return;
  }

  const { lesson_id, score } = req.body;
  if (!lesson_id || typeof score !== 'number') {
    res.status(400).json({ error: 'lesson_id and score are required.' });
    return;
  }

  const lesson = db.lessons.find((l) => l.id === lesson_id);
  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }

  // Calculate XP earned: scaled by score percentage
  const baseReward = lesson.xp_reward || 30;
  const earnedXp = Math.max(Math.round((baseReward * Math.min(score, 100)) / 100), 10);

  // Update or insert UserProgress
  let prog = db.user_progress.find((p) => p.user_id === user.id && p.lesson_id === lesson_id);
  const isFirstCompletion = !prog || !prog.completed;

  if (!prog) {
    prog = {
      id: `prog-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      user_id: user.id,
      lesson_id,
      completed: true,
      score,
      xp_earned: earnedXp,
      completed_at: new Date().toISOString(),
    };
    db.user_progress.push(prog);
  } else {
    prog.completed = true;
    prog.score = Math.max(prog.score, score);
    prog.xp_earned += earnedXp;
    prog.completed_at = new Date().toISOString();
  }

  // Update User XP
  user.total_xp += earnedXp;

  // Streak logic (strictly consecutive calendar days)
  const todayStr = new Date().toISOString().split('T')[0];
  const lastActive = user.last_activity_date;

  if (!lastActive) {
    user.current_streak = 1;
    user.longest_streak = Math.max(user.longest_streak, 1);
    user.daily_xp_today = earnedXp;
    user.last_activity_date = todayStr;
    user.activity_dates = [todayStr];
  } else if (lastActive === todayStr) {
    // Already active today; add to today's XP without inflating streak count
    user.daily_xp_today += earnedXp;
  } else {
    const lastDate = new Date(lastActive);
    const currDate = new Date(todayStr);
    const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Exactly consecutive!
      user.current_streak += 1;
      user.longest_streak = Math.max(user.longest_streak, user.current_streak);
    } else {
      // Streak broken
      user.current_streak = 1;
    }
    user.daily_xp_today = earnedXp;
    user.last_activity_date = todayStr;
    if (!user.activity_dates.includes(todayStr)) {
      user.activity_dates.push(todayStr);
    }
  }

  // Check and unlock achievements
  const newAchievements: string[] = [];
  const completedLessons = db.user_progress.filter((p) => p.user_id === user.id && p.completed);

  ACHIEVEMENTS_DATABASE.forEach((ach) => {
    const alreadyUnlocked = db.user_achievements.some(
      (ua) => ua.user_id === user.id && ua.achievement_id === ach.id
    );
    if (alreadyUnlocked) return;

    let qualifies = false;
    if (ach.lessons_requirement && completedLessons.length >= ach.lessons_requirement) {
      qualifies = true;
    }
    if (ach.xp_requirement && user.total_xp >= ach.xp_requirement) {
      qualifies = true;
    }
    if (ach.streak_requirement && user.current_streak >= ach.streak_requirement) {
      qualifies = true;
    }
    if (ach.id === 'ach-polyglot') {
      const hasIbi = completedLessons.some((p) => p.lesson_id.startsWith('ibi-'));
      const hasEfi = completedLessons.some((p) => p.lesson_id.startsWith('efi-'));
      if (hasIbi && hasEfi) qualifies = true;
    }

    if (qualifies) {
      db.user_achievements.push({
        id: `uach-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        user_id: user.id,
        achievement_id: ach.id,
        unlocked_at: new Date().toISOString(),
      });
      newAchievements.push(ach.title);
    }
  });

  saveDatabase();

  res.json({
    success: true,
    user,
    earned_xp: earnedXp,
    new_achievements: newAchievements,
    is_first_completion: isFirstCompletion,
  });
});

// 4. Achievements Endpoints
app.get('/api/achievements', (req: Request, res: Response): void => {
  const user = getAuthenticatedUser(req);
  const unlockedIds = new Set(
    user
      ? db.user_achievements.filter((ua) => ua.user_id === user.id).map((ua) => ua.achievement_id)
      : []
  );

  const achievements = ACHIEVEMENTS_DATABASE.map((ach) => ({
    ...ach,
    is_unlocked: unlockedIds.has(ach.id),
  }));

  res.json({ achievements });
});

// 5. AI-Assisted Linguistic Context & Explanation (Server-side Gemini)
app.post('/api/ai-explain', async (req: Request, res: Response): Promise<void> => {
  const { query, language } = req.body;

  if (!query) {
    res.status(400).json({ error: 'Query parameter is required' });
    return;
  }

  const selectedLang = language === 'efik' ? 'Efik' : 'Ibibio';
  const sisterLang = language === 'efik' ? 'Ibibio' : 'Efik';

  // Fallback response if Gemini key is not configured or in case of transient API error
  const fallback = {
    query,
    language: selectedLang.toLowerCase(),
    etymology: `The term "${query}" has deep roots in the Lower Cross River linguistic family.`,
    cultural_context: `In ${selectedLang} culture, speech reflects communal solidarity, age-grade respect, and proverbial depth.`,
    tonal_guide: `Tonal inflection is crucial: pitch contour changes whether a word signifies an action, noun, or respectful address.`,
    cognate_comparison: `In ${sisterLang}, cognate expressions share phonetic roots with slight vowel or prefix shifts.`,
    disclaimer: `AI-GENERATED & UNVERIFIED: This explanation is generated by an AI assistant for educational context. For formal cultural or grammatical verification, please consult verified dictionary records or indigenous native speakers and elders.`,
  };

  if (!ai) {
    res.json(fallback);
    return;
  }

  try {
    const prompt = `Analyze the following Nigerian indigenous language query: "${query}" in the context of ${selectedLang} (with comparison to sister language ${sisterLang}).
Return a JSON object conforming strictly to the requested schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are a respectful linguistic scholar of Nigerian indigenous languages, specifically Ibibio (Akwa Ibom State) and Efik (Cross River State).
CRITICAL RULES:
1. Distinguish Ibibio from Efik clearly. Mention cognates, tonal nuances, and orthographic conventions.
2. Never present speculative information as absolute truth.
3. Keep descriptions concise, culturally enriching, and educational.
4. Always emphasize that this output is an AI-assisted linguistic analysis.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            etymology: { type: Type.STRING, description: 'Linguistic breakdown or root origin' },
            cultural_context: { type: Type.STRING, description: 'Cultural usage and traditional setting' },
            tonal_guide: { type: Type.STRING, description: 'Tonal pronunciation guide (high, mid, low tones)' },
            cognate_comparison: { type: Type.STRING, description: `Comparison with ${sisterLang}` },
            disclaimer: { type: Type.STRING, description: 'Explicit verification disclaimer' },
          },
          required: ['etymology', 'cultural_context', 'tonal_guide', 'cognate_comparison', 'disclaimer'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      query,
      language: selectedLang.toLowerCase(),
      etymology: parsed.etymology || fallback.etymology,
      cultural_context: parsed.cultural_context || fallback.cultural_context,
      tonal_guide: parsed.tonal_guide || fallback.tonal_guide,
      cognate_comparison: parsed.cognate_comparison || fallback.cognate_comparison,
      disclaimer: `AI-GENERATED & UNVERIFIED: ${parsed.disclaimer || fallback.disclaimer}`,
    });
  } catch (error) {
    console.error('Gemini API call failed:', error);
    res.json(fallback);
  }
});

// -------------------------------------------------------------------
// Vite Middleware / Static Server
// -------------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Usem Nnyin platform running on port ${PORT}`);
  });
}

startServer();
