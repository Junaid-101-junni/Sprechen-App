"use client";

import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import {
  Mic,
  GraduationCap,
  ListChecks,
  BookOpen,
  Headphones,
  PenLine,
  Blocks,
  User,
  type LucideIcon,
} from "lucide-react";

interface MoreItem {
  label: string;
  description: string;
  icon: LucideIcon;
  view: "pronunciation" | "grammar" | "quiz" | "lessons" | "listening" | "writing" | "sentence" | "profile";
  color: string;
}

const MORE_ITEMS: MoreItem[] = [
  { label: "Lessons", description: "Real-life dialogues with audio", icon: BookOpen, view: "lessons", color: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" },
  { label: "Listening", description: "Audio exercises + questions", icon: Headphones, view: "listening", color: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" },
  { label: "Speaking", description: "Pronunciation coach", icon: Mic, view: "pronunciation", color: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
  { label: "Writing", description: "Get AI feedback on your German", icon: PenLine, view: "writing", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  { label: "Sentence Builder", description: "Build German sentences", icon: Blocks, view: "sentence", color: "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300" },
  { label: "Grammar", description: "Lessons with examples", icon: GraduationCap, view: "grammar", color: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300" },
  { label: "Quiz", description: "Test your knowledge", icon: ListChecks, view: "quiz", color: "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300" },
  { label: "Profile", description: "Your progress & achievements", icon: User, view: "profile", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300" },
];

export function MoreView() {
  const setView = useAppStore((s) => s.setView);

  return (
    <div className="px-4 py-4 space-y-5">
      <div>
        <h1 className="text-2xl font-bold mb-1">More Learning Tools</h1>
        <p className="text-sm text-muted-foreground">
          Everything you need to master German
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MORE_ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setView(item.view)}
              className="group bg-card border border-border/60 rounded-xl p-4 text-left hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-2.5`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-semibold text-sm">{item.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
            </motion.button>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-border/50 rounded-xl p-4">
        <h3 className="font-semibold text-sm mb-2">💡 Pro Tip</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Mix different learning modes daily: flashcards for vocabulary, dialogues for context,
          listening for comprehension, and writing for production. The brain learns best with variety!
        </p>
      </div>
    </div>
  );
}
