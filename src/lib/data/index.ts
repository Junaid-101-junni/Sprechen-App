// Central index for all German learning data
// Combines curated cores + extended banks

import type { VocabWord, CEFRLevel, GrammarLesson, QuizQuestion, Dialogue, ListeningExercise, SentenceExercise, WordCategory } from "./types";
import { A1_WORDS } from "./a1-vocab";
import { A2_WORDS } from "./a2-vocab";
import { B1_WORDS } from "./b1-vocab";
import { B2_WORDS } from "./b2-vocab";
import {
  A1_EXTENDED_WORDS,
  A2_EXTENDED_WORDS,
  B1_EXTENDED_WORDS,
  B2_EXTENDED_WORDS,
} from "./extended-vocab";
import { GRAMMAR_LESSONS, QUIZ_QUESTIONS, DIALOGUES, LISTENING_EXERCISES, SENTENCE_EXERCISES } from "./lessons";

// ============== ALL VOCABULARY ==============
export const ALL_VOCABULARY: VocabWord[] = [
  ...A1_WORDS,
  ...A2_WORDS,
  ...B1_WORDS,
  ...B2_WORDS,
  ...A1_EXTENDED_WORDS,
  ...A2_EXTENDED_WORDS,
  ...B1_EXTENDED_WORDS,
  ...B2_EXTENDED_WORDS,
];

// ============== LEVEL-SPECIFIC ACCESSORS ==============
export function getWordsByLevel(level: CEFRLevel, includeExtended = true): VocabWord[] {
  const core: VocabWord[] = [];
  if (level === "A1") core.push(...A1_WORDS);
  if (level === "A2") core.push(...A2_WORDS);
  if (level === "B1") core.push(...B1_WORDS);
  if (level === "B2") core.push(...B2_WORDS);
  if (!includeExtended) return core;
  if (level === "A1") return [...core, ...A1_EXTENDED_WORDS];
  if (level === "A2") return [...core, ...A2_EXTENDED_WORDS];
  if (level === "B1") return [...core, ...B1_EXTENDED_WORDS];
  if (level === "B2") return [...core, ...B2_EXTENDED_WORDS];
  return core;
}

export function getCoreWordsByLevel(level: CEFRLevel): VocabWord[] {
  if (level === "A1") return A1_WORDS;
  if (level === "A2") return A2_WORDS;
  if (level === "B1") return B1_WORDS;
  if (level === "B2") return B2_WORDS;
  return [];
}

export function getGrammarByLevel(level: CEFRLevel): GrammarLesson[] {
  return GRAMMAR_LESSONS.filter((g) => g.level === level);
}

export function getQuizByLevel(level: CEFRLevel): QuizQuestion[] {
  return QUIZ_QUESTIONS.filter((q) => q.level === level);
}

export function getDialoguesByLevel(level: CEFRLevel): Dialogue[] {
  return DIALOGUES.filter((d) => d.level === level);
}

export function getListeningByLevel(level: CEFRLevel): ListeningExercise[] {
  return LISTENING_EXERCISES.filter((l) => l.level === level);
}

export function getSentenceExercisesByLevel(level: CEFRLevel): SentenceExercise[] {
  return SENTENCE_EXERCISES.filter((s) => s.level === level);
}

export function findWordById(id: string): VocabWord | undefined {
  return ALL_VOCABULARY.find((w) => w.id === id);
}

export function searchVocabulary(query: string, level?: CEFRLevel): VocabWord[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const pool = level ? getWordsByLevel(level) : ALL_VOCABULARY;
  return pool.filter(
    (w) =>
      w.german.toLowerCase().includes(q) ||
      w.english.toLowerCase().includes(q)
  ).slice(0, 30);
}

// ============== STATS ==============
export const VOCAB_STATS = {
  A1: { core: A1_WORDS.length, extended: A1_EXTENDED_WORDS.length, total: A1_WORDS.length + A1_EXTENDED_WORDS.length },
  A2: { core: A2_WORDS.length, extended: A2_EXTENDED_WORDS.length, total: A2_WORDS.length + A2_EXTENDED_WORDS.length },
  B1: { core: B1_WORDS.length, extended: B1_EXTENDED_WORDS.length, total: B1_WORDS.length + B1_EXTENDED_WORDS.length },
  B2: { core: B2_WORDS.length, extended: B2_EXTENDED_WORDS.length, total: B2_WORDS.length + B2_EXTENDED_WORDS.length },
  total: ALL_VOCABULARY.length,
};

// Re-export types and constants
export type { VocabWord, CEFRLevel, WordCategory, GrammarLesson, QuizQuestion, Dialogue, ListeningExercise, SentenceExercise };
export { LEVELS, CATEGORY_LABELS } from "./types";
