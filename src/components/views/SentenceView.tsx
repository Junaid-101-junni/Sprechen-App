"use client";

import { useState, useMemo, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { getSentenceExercisesByLevel, type SentenceExercise, type CEFRLevel } from "@/lib/german-data";
import { motion, AnimatePresence } from "framer-motion";
import { Blocks, CheckCircle2, XCircle, ChevronRight, Lightbulb, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export function SentenceView() {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const setLevel = useAppStore((s) => s.setLevel);
  const recordSentence = useAppStore((s) => s.recordSentence);
  const sentencesBuilt = useAppStore((s) => s.sentencesBuilt);

  const allExercises = useMemo(() => getSentenceExercisesByLevel(currentLevel), [currentLevel]);
  const [exercises, setExercises] = useState<SentenceExercise[]>(() => {
    const qs = getSentenceExercisesByLevel(currentLevel);
    return [...qs].sort(() => Math.random() - 0.5).slice(0, 8);
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Sync exercises when allExercises changes (level switch via parent key remount)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExercises([...allExercises].sort(() => Math.random() - 0.5).slice(0, 8));
  }, [allExercises]);

  // Reset selection when currentIdx/exercises change - uses parent key remount pattern
  useEffect(() => {
    if (exercises.length > 0 && exercises[currentIdx]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAvailableWords([...exercises[currentIdx].shuffledWords].sort(() => Math.random() - 0.5));
      setSelectedWords([]);
      setSubmitted(false);
      setShowHint(false);
    }
  }, [currentIdx, exercises]);

  const current = exercises[currentIdx];

  const selectWord = (word: string) => {
    if (submitted) return;
    setSelectedWords([...selectedWords, word]);
    setAvailableWords(availableWords.filter((w, i) => i !== availableWords.indexOf(word)));
  };

  const deselectWord = (idx: number) => {
    if (submitted) return;
    const word = selectedWords[idx];
    setSelectedWords(selectedWords.filter((_, i) => i !== idx));
    setAvailableWords([...availableWords, word]);
  };

  const checkAnswer = () => {
    if (!current) return;
    const userAnswer = selectedWords.join(" ").replace(/\s+\./g, ".").replace(/\s+\?/g, "?").replace(/\s+,/g, ",").trim();
    const correctAnswer = current.correctGerman.trim();
    const isCorrect = userAnswer === correctAnswer ||
      userAnswer.replace(/[.,!?]/g, "") === correctAnswer.replace(/[.,!?]/g, "");
    setCorrect(isCorrect);
    setSubmitted(true);
    if (isCorrect) {
      recordSentence();
      toast.success("Correct! +12 XP");
    } else {
      toast.error("Not quite. Try again or see the answer.");
    }
  };

  const next = () => {
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      // Loop or show summary
      toast.info("🎉 All sentences completed!");
      setExercises([...allExercises].sort(() => Math.random() - 0.5).slice(0, 8));
      setCurrentIdx(0);
    }
  };

  const retry = () => {
    if (!current) return;
    setAvailableWords([...current.shuffledWords].sort(() => Math.random() - 0.5));
    setSelectedWords([]);
    setSubmitted(false);
    setCorrect(false);
  };

  if (!current) {
    return (
      <div className="px-4 py-8 text-center">
        <Blocks className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Loading sentences...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold mb-1">Sentence Builder</h1>
        <p className="text-sm text-muted-foreground">Tap words in the correct order to build German sentences</p>
      </div>

      {/* Level selector */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
        {(["A1", "A2", "B1", "B2"] as CEFRLevel[]).map((lvl) => (
          <button
            key={lvl}
            onClick={() => {
              setLevel(lvl);
              setCurrentIdx(0);
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              currentLevel === lvl
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground/70"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Sentence {currentIdx + 1} of {exercises.length}</span>
        <span className="text-muted-foreground">Built: <span className="font-semibold text-foreground">{sentencesBuilt}</span></span>
      </div>
      <Progress value={((currentIdx + 1) / exercises.length) * 100} className="h-1" />

      {/* English prompt */}
      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-teal-50 via-card to-emerald-50 dark:from-teal-950/20 dark:via-card dark:to-emerald-950/20 border border-border/60 rounded-2xl p-4"
      >
        <Badge variant="secondary" className="mb-2">English</Badge>
        <p className="text-base font-medium">{current.englishSentence}</p>
        {current.hint && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="mt-2 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            {showHint ? current.hint : "Show hint"}
          </button>
        )}
      </motion.div>

      {/* Built sentence area */}
      <div className={`min-h-[80px] p-3 rounded-xl border-2 border-dashed transition-colors ${
        submitted ? (correct ? "border-accent bg-accent/5" : "border-rose-300 bg-rose-50 dark:bg-rose-950/20") : "border-border/60 bg-card"
      }`}>
        <div className="flex flex-wrap gap-1.5 min-h-[40px] items-center">
          {selectedWords.length === 0 ? (
            <span className="text-xs text-muted-foreground italic">Tap words below to build your sentence...</span>
          ) : (
            <AnimatePresence>
              {selectedWords.map((word, idx) => (
                <motion.button
                  key={`${word}-${idx}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => deselectWord(idx)}
                  disabled={submitted}
                  className="px-2.5 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                >
                  {word}
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Available words */}
      <div className="flex flex-wrap gap-1.5 min-h-[40px]">
        <AnimatePresence>
          {availableWords.map((word, idx) => (
            <motion.button
              key={`${word}-${idx}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => selectWord(word)}
              disabled={submitted}
              className="px-2.5 py-1.5 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/70 border border-border/40"
            >
              {word}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Result */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 border ${
              correct ? "bg-accent/10 border-accent/40" : "bg-rose-50 dark:bg-rose-950/20 border-rose-300/60"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {correct ? (
                <CheckCircle2 className="w-5 h-5 text-accent" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-500" />
              )}
              <span className="font-semibold text-sm">
                {correct ? "Perfect!" : "Not quite"}
              </span>
            </div>
            {!correct && (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Your answer: </span>
                  <span className="line-through text-rose-600">{selectedWords.join(" ")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Correct: </span>
                  <span className="font-semibold text-accent">{current.correctGerman}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-2">
        {!submitted ? (
          <Button
            onClick={checkAnswer}
            className="flex-1 bg-accent hover:bg-accent/90"
            disabled={selectedWords.length === 0}
          >
            Check Answer
          </Button>
        ) : (
          <>
            <Button onClick={retry} variant="outline" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Retry
            </Button>
            <Button onClick={next} className="flex-1">
              Next
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
