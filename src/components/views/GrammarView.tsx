"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { getGrammarByLevel, type CEFRLevel, type GrammarLesson } from "@/lib/german-data";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, ChevronDown, BookOpen, Lightbulb, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function GrammarView() {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const setLevel = useAppStore((s) => s.setLevel);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const lessons = useMemo(() => getGrammarByLevel(currentLevel), [currentLevel]);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 text-xs font-medium mb-2">
          <GraduationCap className="w-3.5 h-3.5" />
          Grammar Lessons
        </div>
        <h2 className="text-xl font-bold">Master German Grammar</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Level {currentLevel} · {lessons.length} lessons
        </p>
      </div>

      {/* Level selector */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
        {(["A1", "A2", "B1", "B2"] as CEFRLevel[]).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setLevel(lvl)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              currentLevel === lvl
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-foreground/70 hover:bg-secondary/70"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Lessons accordion */}
      <div className="space-y-3">
        {lessons.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No grammar lessons for this level yet.
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            value={expandedLesson || undefined}
            onValueChange={(v) => setExpandedLesson(v)}
            className="space-y-3"
          >
            {lessons.map((lesson, idx) => (
              <AccordionItem
                key={lesson.id}
                value={lesson.id}
                className="border border-border/60 rounded-xl px-4 bg-card overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-start gap-3 text-left flex-1">
                    <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{lesson.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{lesson.summary}</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-1">
                  <LessonDetail lesson={lesson} onSpeak={speak} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Footer note */}
      <div className="bg-secondary/40 border border-border/50 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <BookOpen className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Tip:</strong> Grammar rules are patterns, not laws.
            Don&apos;t try to memorize them — read the examples aloud, then practice in the AI Chat to make them stick.
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonDetail({
  lesson,
  onSpeak,
}: {
  lesson: GrammarLesson;
  onSpeak: (text: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 pt-2"
    >
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          Explanation
        </div>
        <p className="text-sm text-foreground/85 leading-relaxed">{lesson.explanation}</p>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Examples
        </div>
        <div className="space-y-2">
          {lesson.examples.map((ex, i) => (
            <div
              key={i}
              className="bg-secondary/50 border border-border/40 rounded-lg p-3"
            >
              <div className="flex items-start gap-2 mb-1">
                <span className="text-sm font-medium flex-1">{ex.de}</span>
                <button
                  onClick={() => onSpeak(ex.de)}
                  className="text-primary hover:scale-110 transition-transform flex-shrink-0"
                  aria-label="Listen to German"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-muted-foreground">{ex.en}</div>
            </div>
          ))}
        </div>
      </div>

      {lesson.tip && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
            <Lightbulb className="w-3.5 h-3.5" />
            Pro Tip
          </div>
          <div className="text-xs text-foreground/80 leading-relaxed">{lesson.tip}</div>
        </div>
      )}
    </motion.div>
  );
}
