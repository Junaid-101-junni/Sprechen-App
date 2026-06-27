// Shared types for German learning data

export type CEFRLevel = "A1" | "A2" | "B1" | "B2";

export type WordCategory =
  | "greetings"
  | "food"
  | "travel"
  | "family"
  | "work"
  | "home"
  | "nature"
  | "body"
  | "time"
  | "emotions"
  | "shopping"
  | "education"
  | "technology"
  | "health"
  | "verbs"
  | "adjectives"
  | "adverbs"
  | "connectors"
  | "numbers"
  | "question"
  | "colors"
  | "clothing"
  | "weather"
  | "city"
  | "transport"
  | "hobbies"
  | "media"
  | "politics"
  | "environment"
  | "business"
  | "law"
  | "art"
  | "science";

export interface Conjugation {
  ich: string;
  du: string;
  er: string; // er/sie/es
  wir: string;
  ihr: string;
  sie: string; // sie/Sie
}

export interface VocabWord {
  id: string;
  level: CEFRLevel;
  german: string;
  english: string;
  article?: "der" | "die" | "das"; // for nouns
  plural?: string;
  ipa?: string;
  example: { de: string; en: string };
  category: WordCategory;
  frequency?: number; // 1=most common, 100+=rare
  tags?: string[];
  mnemonic?: string;
  isIrregular?: boolean;
  conjugation?: Conjugation; // for verbs
  pastParticiple?: string;
  praeteritum?: string;
  synonyms?: string[];
  antonyms?: string[];
  collocations?: string[];
  wordFamily?: string[];
  register?: "formal" | "informal" | "neutral";
}

export interface GrammarLesson {
  id: string;
  level: CEFRLevel;
  title: string;
  summary: string;
  explanation: string;
  examples: { de: string; en: string }[];
  tip?: string;
  category?: string;
}

export type QuizType = "multiple-choice" | "fill-blank" | "translation" | "article" | "word-order";

export interface QuizQuestion {
  id: string;
  level: CEFRLevel;
  type: QuizType;
  question: string;
  options?: string[];
  answer: string;
  acceptableAnswers?: string[]; // alternative correct answers
  explanation?: string;
  category: WordCategory | "grammar";
  difficulty?: 1 | 2 | 3;
}

export interface Dialogue {
  id: string;
  level: CEFRLevel;
  title: string;
  scenario: string;
  setting: string;
  characters: { name: string; role: string }[];
  lines: { speaker: string; text: string; translation: string }[];
  vocabulary: { german: string; english: string }[];
  comprehensionQuestions?: { question: string; answer: string; options?: string[] }[];
  tags?: string[];
}

export interface ListeningExercise {
  id: string;
  level: CEFRLevel;
  title: string;
  description: string;
  audioText: string; // German text that will be spoken
  translation: string;
  duration: string; // estimated
  questions: {
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
  }[];
  topic: string;
}

export interface SentenceExercise {
  id: string;
  level: CEFRLevel;
  englishSentence: string;
  correctGerman: string;
  shuffledWords: string[]; // pre-shuffled word tokens
  hint?: string;
}

export const LEVELS: { code: CEFRLevel; name: string; description: string; color: string }[] = [
  { code: "A1", name: "Beginner", description: "Basic everyday expressions & simple phrases", color: "emerald" },
  { code: "A2", name: "Elementary", description: "Routine tasks & direct exchanges", color: "amber" },
  { code: "B1", name: "Intermediate", description: "Handle most travel situations & opinions", color: "rose" },
  { code: "B2", name: "Upper Intermediate", description: "Complex texts & spontaneous fluency", color: "teal" },
];

export const CATEGORY_LABELS: Record<WordCategory, string> = {
  greetings: "Greetings",
  food: "Food & Drink",
  travel: "Travel",
  family: "Family",
  work: "Work",
  home: "Home",
  nature: "Nature",
  body: "Body",
  time: "Time",
  emotions: "Emotions",
  shopping: "Shopping",
  education: "Education",
  technology: "Technology",
  health: "Health",
  verbs: "Verbs",
  adjectives: "Adjectives",
  adverbs: "Adverbs",
  connectors: "Connectors",
  numbers: "Numbers",
  question: "Question Words",
  colors: "Colors",
  clothing: "Clothing",
  weather: "Weather",
  city: "City",
  transport: "Transport",
  hobbies: "Hobbies",
  media: "Media",
  politics: "Politics",
  environment: "Environment",
  business: "Business",
  law: "Law",
  art: "Art",
  science: "Science",
};
