// Juni Boli Talk - Complete Zustand store
// SM-2 spaced repetition + user profile + conversations + mistakes + saved vocab + enhanced gamification

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CEFRLevel } from "./german-data";

export type ViewName =
  | "home"
  | "vocab"
  | "chat"
  | "talk"
  | "translate"
  | "saved-vocab"
  | "history"
  | "roleplay"
  | "pronunciation"
  | "grammar"
  | "quiz"
  | "profile"
  | "lessons"
  | "listening"
  | "writing"
  | "sentence"
  | "more"
  | "plan";

// ============== SM-2 SPACED REPETITION ==============
export interface SM2Card {
  wordId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: number;
  lastReview: number;
  qualitySum: number;
  reviewCount: number;
  correctCount: number;
  wrongCount: number;
  status: "new" | "learning" | "review" | "mastered";
}

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

function sm2Update(card: SM2Card, quality: Quality): SM2Card {
  const q = quality;
  let { easeFactor, interval, repetitions } = card;

  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const now = Date.now();
  const nextReview = now + interval * 24 * 60 * 60 * 1000;

  let status: SM2Card["status"] = "learning";
  if (q < 3) status = "learning";
  else if (repetitions >= 5 && interval >= 21) status = "mastered";
  else if (repetitions >= 1) status = "review";

  return {
    ...card,
    easeFactor,
    interval,
    repetitions,
    nextReview,
    lastReview: now,
    qualitySum: card.qualitySum + q,
    reviewCount: card.reviewCount + 1,
    correctCount: card.correctCount + (q >= 3 ? 1 : 0),
    wrongCount: card.wrongCount + (q < 3 ? 1 : 0),
    status,
  };
}

// ============== ACHIEVEMENTS ==============
export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
  icon?: string;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "first-word", title: "First Steps", description: "Review your first word", unlocked: false, icon: "🌱" },
  { id: "ten-words", title: "Vocabulary Builder", description: "Learn 10 words", unlocked: false, icon: "📚" },
  { id: "fifty-words", title: "Word Smith", description: "Learn 50 words", unlocked: false, icon: "✏️" },
  { id: "hundred-words", title: "Centurion", description: "Learn 100 words", unlocked: false, icon: "💯" },
  { id: "streak-3", title: "On Fire", description: "3-day streak", unlocked: false, icon: "🔥" },
  { id: "streak-7", title: "Week Warrior", description: "7-day streak", unlocked: false, icon: "⚡" },
  { id: "streak-30", title: "Unstoppable", description: "30-day streak", unlocked: false, icon: "🚀" },
  { id: "first-quiz", title: "Quiz Master", description: "Pass your first quiz", unlocked: false, icon: "🎯" },
  { id: "chat-10", title: "Chatterbox", description: "Send 10 AI chat messages", unlocked: false, icon: "💬" },
  { id: "chat-100", title: "Conversationalist", description: "Send 100 AI chat messages", unlocked: false, icon: "🗣️" },
  { id: "pronunciation-5", title: "Speak Up", description: "Practice pronunciation 5 times", unlocked: false, icon: "🎤" },
  { id: "pronunciation-50", title: "Voice Coach", description: "Practice pronunciation 50 times", unlocked: false, icon: "🎙️" },
  { id: "xp-500", title: "Rising Star", description: "Earn 500 XP", unlocked: false, icon: "⭐" },
  { id: "xp-2000", title: "Deutsch Pro", description: "Earn 2000 XP", unlocked: false, icon: "🏆" },
  { id: "xp-10000", title: "Legend", description: "Earn 10000 XP", unlocked: false, icon: "👑" },
  { id: "master-50", title: "Memory Master", description: "Master 50 words (SM-2)", unlocked: false, icon: "🧠" },
  { id: "dialogue-complete", title: "Story Listener", description: "Complete a dialogue lesson", unlocked: false, icon: "📖" },
  { id: "writing-first", title: "First Words", description: "Submit your first writing", unlocked: false, icon: "✍️" },
  { id: "sentence-builder", title: "Architect", description: "Build 20 sentences correctly", unlocked: false, icon: "🏗️" },
  { id: "listening-5", title: "Good Listener", description: "Complete 5 listening exercises", unlocked: false, icon: "👂" },
  { id: "speak-10min", title: "Speak Up", description: "10 minutes of speaking", unlocked: false, icon: "🗣️" },
  { id: "speak-60min", title: "Fluent Speaker", description: "60 minutes of speaking", unlocked: false, icon: "⏰" },
];

// ============== DAILY GOALS ==============
export interface DailyGoal {
  date: string;
  wordsReviewed: number;
  xpEarned: number;
  chatMessages: number;
  quizPassed: number;
  speakingSeconds: number;
  completed: boolean;
}

export const DAILY_GOALS = {
  wordsPerDay: 20,
  xpPerDay: 100,
  chatPerDay: 5,
  speakingPerDay: 300, // 5 minutes
  quizzesPerWeek: 3,
};

// ============== USER PROFILE ==============
export interface UserProfile {
  onboarded: boolean;
  name: string;
  level: CEFRLevel;
  goals: string[];
  situations: string[];
  dailyMinutes: number;
  tutorPersonaId: string;
  createdAt: number;
}

// ============== CONVERSATIONS ==============
export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  translation?: string;
  corrections?: { original: string; corrected: string; explanation: string }[];
  newVocab?: { german: string; english: string }[];
  encouragement?: string;
  timestamp: number;
  spoken?: boolean;
}

export interface ConversationSession {
  id: string;
  title: string;
  topic?: string;
  scenario?: string;
  level: CEFRLevel;
  messages: ConversationMessage[];
  vocabCollected: { german: string; english: string }[];
  correctionsMade: { original: string; corrected: string; explanation: string }[];
  startedAt: number;
  updatedAt: number;
  messageCount: number;
  speakingSeconds: number;
}

// ============== MISTAKES ==============
export interface MistakeReview {
  id: string;
  original: string;
  corrected: string;
  explanation: string;
  context: string;
  count: number;
  lastSeen: number;
  level: CEFRLevel;
}

// ============== SAVED VOCAB ==============
export interface SavedWord {
  german: string;
  english: string;
  article?: "der" | "die" | "das";
  type?: string;
  example?: string;
  context?: string;
  level: CEFRLevel;
  savedAt: number;
}

// ============== STORE ==============
interface AppState {
  // Navigation
  currentView: ViewName;
  currentLevel: CEFRLevel;
  setView: (v: ViewName) => void;
  setLevel: (l: CEFRLevel) => void;

  // Progress
  xp: number;
  streak: number;
  lastStudyDate: string | null;
  sm2Cards: Record<string, SM2Card>;
  quizzesPassed: number;
  chatMessages: number;
  pronunciationAttempts: number;
  dialoguesCompleted: number;
  listeningCompleted: number;
  writingSubmitted: number;
  sentencesBuilt: number;
  speakingSeconds: number; // total speaking time

  // Daily goals
  dailyGoals: Record<string, DailyGoal>;

  // User profile
  profile: UserProfile;
  setProfile: (p: Partial<UserProfile>) => void;
  completeOnboarding: (p: Partial<UserProfile>) => void;

  // Conversations
  conversations: ConversationSession[];
  currentConversationId: string | null;
  startConversation: (title: string, topic?: string, scenario?: string) => string;
  addMessageToConversation: (id: string, message: ConversationMessage) => void;
  endConversation: (id: string) => void;
  deleteConversation: (id: string) => void;

  // Mistakes
  mistakes: MistakeReview[];
  recordMistakes: (corrections: { original: string; corrected: string; explanation: string }[], context: string, level: CEFRLevel) => void;

  // Saved vocab
  savedVocab: SavedWord[];
  saveWord: (word: SavedWord) => void;
  unsaveWord: (german: string) => void;
  isWordSaved: (german: string) => boolean;

  // Settings
  enableAudio: boolean;
  dailyTarget: number;
  setEnableAudio: (b: boolean) => void;
  setDailyTarget: (n: number) => void;

  // Actions
  addXp: (amount: number) => void;
  reviewWord: (wordId: string, quality: Quality) => void;
  recordQuizResult: (passed: boolean) => void;
  recordChatMessage: () => void;
  recordPronunciation: () => void;
  recordDialogue: () => void;
  recordListening: () => void;
  recordWriting: () => void;
  recordSentence: () => void;
  recordSpeaking: (seconds: number) => void;
  resetProgress: () => void;

  // Achievements
  achievements: Achievement[];
  checkAchievements: () => void;

  // Daily goal helpers
  getTodayGoal: () => DailyGoal;
  updateTodayGoal: (updates: Partial<DailyGoal>) => void;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function updateStreakLogic(lastStudyDate: string | null): number {
  if (!lastStudyDate) return 1;
  const today = todayStr();
  if (lastStudyDate === today) return 0;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (lastStudyDate === yesterday.toISOString().slice(0, 10)) return -1;
  return 1;
}

function getEmptyGoal(): DailyGoal {
  return {
    date: todayStr(),
    wordsReviewed: 0,
    xpEarned: 0,
    chatMessages: 0,
    quizPassed: 0,
    speakingSeconds: 0,
    completed: false,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentView: "home",
      currentLevel: "A1",
      setView: (v) => set({ currentView: v }),
      setLevel: (l) => set({ currentLevel: l }),

      xp: 0,
      streak: 0,
      lastStudyDate: null,
      sm2Cards: {},
      quizzesPassed: 0,
      chatMessages: 0,
      pronunciationAttempts: 0,
      dialoguesCompleted: 0,
      listeningCompleted: 0,
      writingSubmitted: 0,
      sentencesBuilt: 0,
      speakingSeconds: 0,

      dailyGoals: {},

      profile: {
        onboarded: false,
        name: "",
        level: "A1",
        goals: [],
        situations: [],
        dailyMinutes: 15,
        tutorPersonaId: "anna",
        createdAt: 0,
      },
      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      completeOnboarding: (p) => set((s) => ({
        profile: { ...s.profile, ...p, onboarded: true, createdAt: Date.now() },
        currentLevel: p.level || s.profile.level || "A1",
      })),

      conversations: [],
      currentConversationId: null,
      startConversation: (title, topic, scenario) => {
        const id = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const session: ConversationSession = {
          id, title, topic, scenario,
          level: get().currentLevel,
          messages: [],
          vocabCollected: [],
          correctionsMade: [],
          startedAt: Date.now(),
          updatedAt: Date.now(),
          messageCount: 0,
          speakingSeconds: 0,
        };
        set((s) => ({ conversations: [session, ...s.conversations].slice(0, 50), currentConversationId: id }));
        return id;
      },
      addMessageToConversation: (id, message) => {
        set((s) => ({
          conversations: s.conversations.map((c) => c.id !== id ? c : {
            ...c,
            messages: [...c.messages, message],
            messageCount: c.messageCount + 1,
            updatedAt: Date.now(),
            vocabCollected: message.newVocab ? [...c.vocabCollected, ...message.newVocab.filter(v => !c.vocabCollected.some(e => e.german === v.german))] : c.vocabCollected,
            correctionsMade: message.corrections ? [...c.correctionsMade, ...message.corrections] : c.correctionsMade,
          }),
        }));
      },
      endConversation: () => set({ currentConversationId: null }),
      deleteConversation: (id) => set((s) => ({ conversations: s.conversations.filter((c) => c.id !== id) })),

      mistakes: [],
      recordMistakes: (corrections, context, level) => {
        if (!corrections?.length) return;
        set((s) => {
          const updated = [...s.mistakes];
          for (const c of corrections) {
            const idx = updated.findIndex((m) => m.original === c.original && m.corrected === c.corrected);
            if (idx >= 0) {
              updated[idx] = { ...updated[idx], count: updated[idx].count + 1, lastSeen: Date.now(), context };
            } else {
              updated.push({ id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, original: c.original, corrected: c.corrected, explanation: c.explanation, context, count: 1, lastSeen: Date.now(), level });
            }
          }
          return { mistakes: updated.slice(-200) };
        });
      },

      savedVocab: [],
      saveWord: (word) => set((s) => s.savedVocab.some((w) => w.german.toLowerCase() === word.german.toLowerCase()) ? s : { savedVocab: [{ ...word, savedAt: Date.now() }, ...s.savedVocab] }),
      unsaveWord: (german) => set((s) => ({ savedVocab: s.savedVocab.filter((w) => w.german.toLowerCase() !== german.toLowerCase()) })),
      isWordSaved: (german) => get().savedVocab.some((w) => w.german.toLowerCase() === german.toLowerCase()),

      enableAudio: true,
      dailyTarget: DAILY_GOALS.wordsPerDay,
      setEnableAudio: (b) => set({ enableAudio: b }),
      setDailyTarget: (n) => set({ dailyTarget: n }),

      achievements: DEFAULT_ACHIEVEMENTS,

      addXp: (amount) => {
        set((s) => {
          const today = todayStr();
          const g = s.dailyGoals[today] || getEmptyGoal();
          return { xp: s.xp + amount, dailyGoals: { ...s.dailyGoals, [today]: { ...g, xpEarned: g.xpEarned + amount } } };
        });
        get().checkAchievements();
      },

      reviewWord: (wordId, quality) => {
        set((s) => {
          const existing = s.sm2Cards[wordId] || { wordId, easeFactor: 2.5, interval: 0, repetitions: 0, nextReview: Date.now(), lastReview: 0, qualitySum: 0, reviewCount: 0, correctCount: 0, wrongCount: 0, status: "new" as const };
          const updated = sm2Update(existing, quality);
          const today = todayStr();
          let newStreak = s.streak;
          let newLastStudy = s.lastStudyDate;
          if (s.lastStudyDate !== today) {
            const sig = updateStreakLogic(s.lastStudyDate);
            if (sig === -1) newStreak = s.streak + 1;
            else if (sig === 1) newStreak = 1;
            newLastStudy = today;
          }
          const g = s.dailyGoals[today] || getEmptyGoal();
          const xpGain = quality >= 4 ? 15 : quality >= 3 ? 10 : quality >= 2 ? 3 : 1;
          return { sm2Cards: { ...s.sm2Cards, [wordId]: updated }, streak: newStreak, lastStudyDate: newLastStudy, xp: s.xp + xpGain, dailyGoals: { ...s.dailyGoals, [today]: { ...g, wordsReviewed: g.wordsReviewed + 1, xpEarned: g.xpEarned + xpGain } } };
        });
        get().checkAchievements();
      },

      recordQuizResult: (passed) => {
        set((s) => {
          const today = todayStr();
          const g = s.dailyGoals[today] || getEmptyGoal();
          if (s.lastStudyDate !== today) { const sig = updateStreakLogic(s.lastStudyDate); if (sig === -1) s.streak++; else if (sig === 1) s.streak = 1; s.lastStudyDate = today; }
          return { quizzesPassed: s.quizzesPassed + (passed ? 1 : 0), xp: s.xp + (passed ? 50 : 10), streak: s.streak, lastStudyDate: s.lastStudyDate, dailyGoals: { ...s.dailyGoals, [today]: { ...g, quizPassed: g.quizPassed + (passed ? 1 : 0), xpEarned: g.xpEarned + (passed ? 50 : 10) } } };
        });
        get().checkAchievements();
      },

      recordChatMessage: () => {
        set((s) => {
          const today = todayStr();
          const g = s.dailyGoals[today] || getEmptyGoal();
          if (s.lastStudyDate !== today) { const sig = updateStreakLogic(s.lastStudyDate); if (sig === -1) s.streak++; else if (sig === 1) s.streak = 1; s.lastStudyDate = today; }
          return { chatMessages: s.chatMessages + 1, xp: s.xp + 5, streak: s.streak, lastStudyDate: s.lastStudyDate, dailyGoals: { ...s.dailyGoals, [today]: { ...g, chatMessages: g.chatMessages + 1, xpEarned: g.xpEarned + 5 } } };
        });
        get().checkAchievements();
      },

      recordPronunciation: () => { set((s) => ({ pronunciationAttempts: s.pronunciationAttempts + 1, xp: s.xp + 8 })); get().checkAchievements(); },
      recordDialogue: () => { set((s) => ({ dialoguesCompleted: s.dialoguesCompleted + 1, xp: s.xp + 30 })); get().checkAchievements(); },
      recordListening: () => { set((s) => ({ listeningCompleted: s.listeningCompleted + 1, xp: s.xp + 20 })); get().checkAchievements(); },
      recordWriting: () => { set((s) => ({ writingSubmitted: s.writingSubmitted + 1, xp: s.xp + 25 })); get().checkAchievements(); },
      recordSentence: () => { set((s) => ({ sentencesBuilt: s.sentencesBuilt + 1, xp: s.xp + 12 })); get().checkAchievements(); },
      
      recordSpeaking: (seconds) => {
        set((s) => {
          const today = todayStr();
          const g = s.dailyGoals[today] || getEmptyGoal();
          return { speakingSeconds: s.speakingSeconds + seconds, dailyGoals: { ...s.dailyGoals, [today]: { ...g, speakingSeconds: g.speakingSeconds + seconds } } };
        });
        get().checkAchievements();
      },

      resetProgress: () => set({
        xp: 0, streak: 0, lastStudyDate: null, sm2Cards: {}, quizzesPassed: 0, chatMessages: 0, pronunciationAttempts: 0, dialoguesCompleted: 0, listeningCompleted: 0, writingSubmitted: 0, sentencesBuilt: 0, speakingSeconds: 0,
        dailyGoals: {}, achievements: DEFAULT_ACHIEVEMENTS, conversations: [], mistakes: [], savedVocab: [], currentConversationId: null,
        profile: { onboarded: false, name: "", level: "A1", goals: [], situations: [], dailyMinutes: 15, tutorPersonaId: "anna", createdAt: 0 },
      }),

      checkAchievements: () => {
        const s = get();
        const updated = s.achievements.map((a) => {
          if (a.unlocked) return a;
          let unlock = false;
          const cards = Object.keys(s.sm2Cards).length;
          const mastered = Object.values(s.sm2Cards).filter((c) => c.status === "mastered").length;
          const speakMin = Math.floor(s.speakingSeconds / 60);
          switch (a.id) {
            case "first-word": unlock = cards >= 1; break;
            case "ten-words": unlock = cards >= 10; break;
            case "fifty-words": unlock = cards >= 50; break;
            case "hundred-words": unlock = cards >= 100; break;
            case "streak-3": unlock = s.streak >= 3; break;
            case "streak-7": unlock = s.streak >= 7; break;
            case "streak-30": unlock = s.streak >= 30; break;
            case "first-quiz": unlock = s.quizzesPassed >= 1; break;
            case "chat-10": unlock = s.chatMessages >= 10; break;
            case "chat-100": unlock = s.chatMessages >= 100; break;
            case "pronunciation-5": unlock = s.pronunciationAttempts >= 5; break;
            case "pronunciation-50": unlock = s.pronunciationAttempts >= 50; break;
            case "xp-500": unlock = s.xp >= 500; break;
            case "xp-2000": unlock = s.xp >= 2000; break;
            case "xp-10000": unlock = s.xp >= 10000; break;
            case "master-50": unlock = mastered >= 50; break;
            case "dialogue-complete": unlock = s.dialoguesCompleted >= 1; break;
            case "writing-first": unlock = s.writingSubmitted >= 1; break;
            case "sentence-builder": unlock = s.sentencesBuilt >= 20; break;
            case "listening-5": unlock = s.listeningCompleted >= 5; break;
            case "speak-10min": unlock = speakMin >= 10; break;
            case "speak-60min": unlock = speakMin >= 60; break;
          }
          return unlock ? { ...a, unlocked: true, unlockedAt: Date.now() } : a;
        });
        if (updated.some((a, i) => a.unlocked !== s.achievements[i].unlocked)) set({ achievements: updated });
      },

      getTodayGoal: () => {
        const today = todayStr();
        return get().dailyGoals[today] || getEmptyGoal();
      },

      updateTodayGoal: (updates) => {
        const today = todayStr();
        set((s) => {
          const g = s.dailyGoals[today] || getEmptyGoal();
          const updated = { ...g, ...updates };
          updated.completed = updated.wordsReviewed >= s.dailyTarget && updated.xpEarned >= DAILY_GOALS.xpPerDay;
          return { dailyGoals: { ...s.dailyGoals, [today]: updated } };
        });
      },
    }),
    { name: "linguatalk-storage", version: 1 }
  )
);

// Selectors
export function selectMasteredWords(state: AppState): number {
  return Object.values(state.sm2Cards).filter((c) => c.status === "mastered").length;
}

export function selectDueCardsCount(state: AppState): number {
  const now = Date.now();
  return Object.values(state.sm2Cards).filter((c) => c.status !== "new" && c.nextReview <= now).length;
}

export function selectFluencyScore(state: AppState): number {
  // Fluency = combination of speaking time, conversation count, and accuracy
  const speakMin = state.speakingSeconds / 60;
  const convCount = state.conversations.length;
  const baseScore = Math.min(50, speakMin * 0.5) + Math.min(30, convCount * 2);
  const accuracy = state.mistakes.length > 0
    ? Math.max(0, 20 - state.mistakes.length * 0.5)
    : 20;
  return Math.min(100, Math.round(baseScore + accuracy));
}

export function selectGrammarAccuracy(state: AppState): number {
  if (state.chatMessages === 0) return 100;
  const mistakeRate = state.mistakes.length / state.chatMessages;
  return Math.max(0, Math.round(100 - mistakeRate * 20));
}
