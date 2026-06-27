// Re-export from new data folder structure for backward compatibility
export {
  ALL_VOCABULARY,
  getWordsByLevel,
  getCoreWordsByLevel,
  getGrammarByLevel,
  getQuizByLevel,
  getDialoguesByLevel,
  getListeningByLevel,
  getSentenceExercisesByLevel,
  findWordById,
  searchVocabulary,
  VOCAB_STATS,
  LEVELS,
  CATEGORY_LABELS,
} from "./data";

// Re-export types for backward compatibility
export type {
  VocabWord,
  CEFRLevel,
  WordCategory,
  GrammarLesson,
  QuizQuestion,
  Dialogue,
  ListeningExercise,
  SentenceExercise,
} from "./data";

// Backward-compat aliases (older code may import these)
import { GRAMMAR_LESSONS, QUIZ_QUESTIONS, DIALOGUES, LISTENING_EXERCISES, SENTENCE_EXERCISES } from "./data/lessons";
import { ALL_VOCABULARY } from "./data";

export const VOCABULARY = ALL_VOCABULARY;
export { GRAMMAR_LESSONS, QUIZ_QUESTIONS, DIALOGUES, LISTENING_EXERCISES, SENTENCE_EXERCISES };
