// Word families - show related German words by root
// Helps learners see patterns and remember vocabulary faster

export interface WordFamily {
  root: string;
  rootMeaning: string;
  level: "A1" | "A2" | "B1" | "B2";
  members: {
    word: string;
    english: string;
    type: "noun" | "verb" | "adjective" | "adverb";
  }[];
  pattern: string; // explanation of the pattern
}

export const WORD_FAMILIES: WordFamily[] = [
  {
    root: "wohn-",
    rootMeaning: "live, dwell, reside",
    level: "A1",
    members: [
      { word: "wohnen", english: "to live (reside)", type: "verb" },
      { word: "die Wohnung", english: "apartment", type: "noun" },
      { word: "das Wohnzimmer", english: "living room", type: "noun" },
      { word: "der Wohnort", english: "place of residence", type: "noun" },
      { word: "bewohnen", english: "to inhabit", type: "verb" },
      { word: "mitwohnen", english: "to live together", type: "verb" },
    ],
    pattern: "All words about living/residing share the root 'wohn-'. Add prefixes/suffixes to create new words.",
  },
  {
    root: "sprech-",
    rootMeaning: "speak, talk",
    level: "A1",
    members: [
      { word: "sprechen", english: "to speak", type: "verb" },
      { word: "die Sprache", english: "language", type: "noun" },
      { word: "das Gespräch", english: "conversation", type: "noun" },
      { word: "ansprechen", english: "to address", type: "verb" },
      { word: "besprechen", english: "to discuss", type: "verb" },
      { word: "versprechen", english: "to promise", type: "verb" },
    ],
    pattern: "Verbs with 'sprech-' all relate to speaking. Prefixes change the meaning: an- (address), be- (discuss), ver- (promise).",
  },
  {
    root: "mach-",
    rootMeaning: "make, do",
    level: "A1",
    members: [
      { word: "machen", english: "to make / do", type: "verb" },
      { word: "anmachen", english: "to turn on", type: "verb" },
      { word: "ausmachen", english: "to turn off", type: "verb" },
      { word: "mitmachen", english: "to participate", type: "verb" },
      { word: "kaputtmachen", english: "to break", type: "verb" },
      { word: "fertigmachen", english: "to finish / prepare", type: "verb" },
    ],
    pattern: "Separable prefixes with 'machen' create action verbs. an-/aus- = on/off, mit- = along, kaputt- = broken.",
  },
  {
    root: "fahr-",
    rootMeaning: "drive, travel, ride",
    level: "A2",
    members: [
      { word: "fahren", english: "to drive / travel", type: "verb" },
      { word: "die Fahrt", english: "trip / ride", type: "noun" },
      { word: "der Fahrer", english: "driver", type: "noun" },
      { word: "der Bahnhof", english: "train station", type: "noun" },
      { word: "abfahren", english: "to depart", type: "verb" },
      { word: "anfahren", english: "to start moving / approach", type: "verb" },
    ],
    pattern: "Words about driving/riding share 'fahr-'. 'Bahn' (rail) + 'fahr-' pattern: der Bahnhof.",
  },
  {
    root: "kauf-",
    rootMeaning: "buy, purchase",
    level: "A1",
    members: [
      { word: "kaufen", english: "to buy", type: "verb" },
      { word: "der Kauf", english: "purchase", type: "noun" },
      { word: "der Käufer", english: "buyer", type: "noun" },
      { word: "verkaufen", english: "to sell", type: "verb" },
      { word: "einkaufen", english: "to shop", type: "verb" },
      { word: "der Einkauf", english: "shopping", type: "noun" },
    ],
    pattern: "All buying/selling words share 'kauf-'. 'ver-' often means 'away from self' = sell.",
  },
  {
    root: "lern-",
    rootMeaning: "learn, study",
    level: "A1",
    members: [
      { word: "lernen", english: "to learn", type: "verb" },
      { word: "der Lerner", english: "learner", type: "noun" },
      { word: "die Lerntechnik", english: "learning technique", type: "noun" },
      { word: "kennenlernen", english: "to get to know", type: "verb" },
      { word: "erlernen", english: "to master / acquire", type: "verb" },
    ],
    pattern: "All learning-related words share 'lern-'. 'kennenlernen' = to meet/get acquainted.",
  },
  {
    root: "arbeit-",
    rootMeaning: "work, labor",
    level: "A1",
    members: [
      { word: "arbeiten", english: "to work", type: "verb" },
      { word: "die Arbeit", english: "work", type: "noun" },
      { word: "der Arbeiter", english: "worker", type: "noun" },
      { word: "der Mitarbeiter", english: "employee / co-worker", type: "noun" },
      { word: "zusammenarbeiten", english: "to cooperate", type: "verb" },
      { word: "bearbeiten", english: "to process / edit", type: "verb" },
    ],
    pattern: "Work-related words share 'arbeit-'. 'mit-' = with/together → coworker.",
  },
  {
    root: "wohn-",
    rootMeaning: "live, dwell",
    level: "A1",
    members: [
      { word: "wohnen", english: "to live", type: "verb" },
      { word: "die Wohnung", english: "apartment", type: "noun" },
      { word: "das Wohnzimmer", english: "living room", type: "noun" },
      { word: "bewohnen", english: "to inhabit", type: "verb" },
    ],
    pattern: "All dwelling-related words share 'wohn-'.",
  },
  {
    root: "sag-",
    rootMeaning: "say, tell",
    level: "A1",
    members: [
      { word: "sagen", english: "to say", type: "verb" },
      { word: "die Sage", english: "legend / myth", type: "noun" },
      { word: "aussagen", english: "to testify", type: "verb" },
      { word: "absagen", english: "to cancel", type: "verb" },
      { word: "versagen", english: "to fail", type: "verb" },
      { word: "ansagen", english: "to announce", type: "verb" },
    ],
    pattern: "All say-related words share 'sag-'. ab- = off → cancel, ver- = wrong → fail.",
  },
  {
    root: "denk-",
    rootMeaning: "think",
    level: "A2",
    members: [
      { word: "denken", english: "to think", type: "verb" },
      { word: "das Gedanke", english: "thought", type: "noun" },
      { word: "nachdenken", english: "to reflect", type: "verb" },
      { word: "bedenken", english: "to consider", type: "verb" },
      { word: "erdanken", english: "to think up", type: "verb" },
    ],
    pattern: "Thinking-related words share 'denk-'. 'Gedanke' uses ge- prefix for the noun.",
  },
  {
    root: "seh-",
    rootMeaning: "see, look",
    level: "A1",
    members: [
      { word: "sehen", english: "to see", type: "verb" },
      { word: "die Sehenswürdigkeit", english: "sight", type: "noun" },
      { word: "ansehen", english: "to look at", type: "verb" },
      { word: "zusehen", english: "to watch", type: "verb" },
      { word: "aussehen", english: "to look / appear", type: "verb" },
      { word: "fernsehen", english: "to watch TV", type: "verb" },
    ],
    pattern: "All see-related words share 'seh-'. 'fern-' = far → TV (far-seeing).",
  },
  {
    root: "schreib-",
    rootMeaning: "write",
    level: "A1",
    members: [
      { word: "schreiben", english: "to write", type: "verb" },
      { word: "die Schrift", english: "writing / script", type: "noun" },
      { word: "der Schriftsteller", english: "writer", type: "noun" },
      { word: "abschreiben", english: "to copy", type: "verb" },
      { word: "umschreiben", english: "to rewrite", type: "verb" },
      { word: "verschreiben", english: "to prescribe", type: "verb" },
    ],
    pattern: "All writing-related words share 'schreib-'. ab- = off → copy from, um- = around → rewrite.",
  },
];

// Curated word collections by theme
export interface WordCollection {
  id: string;
  title: string;
  description: string;
  emoji: string;
  level: "A1" | "A2" | "B1" | "B2" | "All";
  wordCount: number;
  // Words are filtered from VOCABULARY by their IDs
  wordIds: string[];
  color: string;
}

export const WORD_COLLECTIONS: WordCollection[] = [
  {
    id: "essential-a1",
    title: "Essential A1 Survival Kit",
    description: "The 30 most important A1 words to survive in Germany",
    emoji: "🆘",
    level: "A1",
    wordCount: 30,
    wordIds: ["a1-g-1", "a1-g-10", "a1-g-12", "a1-g-13", "a1-g-15", "a1-v-1", "a1-v-2", "a1-v-3", "a1-v-4", "a1-v-5", "a1-f-1", "a1-f-3", "a1-f-5", "a1-f-6", "a1-fa-1", "a1-fa-2", "a1-fa-5", "a1-h-1", "a1-h-2", "a1-h-5", "a1-t-1", "a1-t-2", "a1-t-3", "a1-t-11", "a1-pl-2", "a1-pl-3", "a1-v-8", "a1-v-9", "a1-v-10", "a1-pl-10"],
    color: "emerald",
  },
  {
    id: "german-foodie",
    title: "German Foodie Pack",
    description: "Everything you need to order and discuss food in Germany",
    emoji: "🍽️",
    level: "A1",
    wordCount: 25,
    wordIds: ["a1-f-1", "a1-f-2", "a1-f-3", "a1-f-4", "a1-f-5", "a1-f-6", "a1-f-7", "a1-f-8", "a1-f-9", "a1-f-10", "a1-f-11", "a1-f-12", "a1-f-13", "a1-f-14", "a1-f-15", "a1-f-16", "a1-f-17", "a1-f-18", "a1-f-19", "a1-f-20", "a1-f-21", "a1-f-22", "a1-f-23", "a1-f-24", "a1-f-25"],
    color: "amber",
  },
  {
    id: "travel-essentials",
    title: "Travel Essentials",
    description: "Navigate airports, trains, hotels, and directions in German",
    emoji: "✈️",
    level: "A2",
    wordCount: 20,
    wordIds: ["a2-t-1", "a2-t-2", "a2-t-3", "a2-t-4", "a2-t-5", "a2-t-6", "a2-t-7", "a2-t-8", "a2-t-9", "a2-t-10", "a2-t-11", "a2-t-12", "a2-t-13", "a2-t-14", "a2-t-15", "a2-t-17", "a2-t-18", "a2-t-19", "a2-t-20", "a2-d-15"],
    color: "rose",
  },
  {
    id: "work-life",
    title: "Office & Work Life",
    description: "Navigate the German workplace with confidence",
    emoji: "💼",
    level: "A2",
    wordCount: 20,
    wordIds: ["a2-w-1", "a2-w-2", "a2-w-3", "a2-w-4", "a2-w-5", "a2-w-6", "a2-w-7", "a2-w-8", "a2-w-9", "a2-w-10", "a2-w-11", "a2-w-12", "a2-w-13", "a2-w-14", "a2-w-15", "a2-w-16", "a2-w-17", "a2-w-18", "a2-w-19", "a2-w-20"],
    color: "violet",
  },
  {
    id: "body-health",
    title: "Body & Health",
    description: "Visit the doctor and describe symptoms accurately",
    emoji: "🏥",
    level: "A2",
    wordCount: 25,
    wordIds: ["a1-b-1", "a1-b-2", "a1-b-3", "a1-b-4", "a1-b-5", "a1-b-6", "a1-b-7", "a1-b-8", "a1-b-9", "a1-b-10", "a2-he-1", "a2-he-2", "a2-he-3", "a2-he-4", "a2-he-5", "a2-he-6", "a2-he-7", "a2-he-8", "a2-he-9", "a2-he-10", "a2-he-11", "a2-he-12", "a2-he-13", "a2-he-14", "a2-he-15"],
    color: "rose",
  },
  {
    id: "everyday-verbs",
    title: "50 Everyday Verbs",
    description: "The most essential action words you'll use daily",
    emoji: "⚡",
    level: "A1",
    wordCount: 50,
    wordIds: ["a1-v-1", "a1-v-2", "a1-v-3", "a1-v-4", "a1-v-5", "a1-v-6", "a1-v-7", "a1-v-8", "a1-v-9", "a1-v-10", "a1-v-11", "a1-v-12", "a1-v-13", "a1-v-14", "a1-v-15", "a1-v-16", "a1-v-17", "a1-v-18", "a1-v-19", "a1-v-20", "a1-v-21", "a1-v-22", "a1-v-23", "a1-v-24", "a1-v-25", "a2-v-1", "a2-v-2", "a2-v-3", "a2-v-4", "a2-v-5", "a2-v-6", "a2-v-7", "a2-v-8", "a2-v-9", "a2-v-10", "a2-v-11", "a2-v-12", "a2-v-13", "a2-v-14", "a2-v-15", "a2-v-16", "a2-v-17", "a2-v-18", "a2-v-19", "a2-v-20", "a2-v-21", "a2-v-22", "a2-v-23", "a2-v-24", "a2-v-25"],
    color: "amber",
  },
  {
    id: "discuss-opinions",
    title: "Discuss & Debate (B1+)",
    description: "Express opinions, argue, and discuss like a German pro",
    emoji: "💬",
    level: "B1",
    wordCount: 15,
    wordIds: ["b1-o-1", "b1-o-2", "b1-o-3", "b1-o-4", "b1-o-5", "b1-o-6", "b1-o-7", "b1-o-8", "b1-o-9", "b1-o-10", "b1-o-11", "b1-o-12", "b1-o-13", "b1-o-14", "b1-o-15"],
    color: "teal",
  },
  {
    id: "tech-future",
    title: "Technology & Future (B2)",
    description: "Discuss AI, climate, and modern society in German",
    emoji: "🚀",
    level: "B2",
    wordCount: 20,
    wordIds: ["b2-te-1", "b2-te-2", "b2-te-3", "b2-te-4", "b2-te-5", "b2-te-6", "b2-te-7", "b2-te-8", "b2-te-9", "b2-te-10", "b2-n-1", "b2-n-2", "b2-n-3", "b2-n-4", "b2-n-5", "b2-n-6", "b2-n-7", "b2-n-8", "b2-n-9", "b2-n-10"],
    color: "violet",
  },
];
