"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { getListeningByLevel, type ListeningExercise, type CEFRLevel } from "@/lib/german-data";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Headphones, CheckCircle2, XCircle, ChevronLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export function ListeningView() {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const setLevel = useAppStore((s) => s.setLevel);
  const recordListening = useAppStore((s) => s.recordListening);

  const exercises = useMemo(() => getListeningByLevel(currentLevel), [currentLevel]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [playing, setPlaying] = useState(false);

  const current = exercises[currentIdx];

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setPlaying(true);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.rate = 0.9;
    u.onend = () => setPlaying(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const submit = () => {
    setSubmitted(true);
    if (!current) return;
    const correct = current.questions.filter((q, i) => answers[i] === q.answer).length;
    const total = current.questions.length;
    if (correct === total) {
      recordListening();
      toast.success(`Perfect! +20 XP earned`);
    } else {
      toast.info(`${correct}/${total} correct · +5 XP for trying`);
    }
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    setShowTranslation(false);
  };

  const next = () => {
    setCurrentIdx((i) => (i + 1) % exercises.length);
    reset();
  };

  if (!current) {
    return (
      <div className="px-4 py-8 text-center">
        <Headphones className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No listening exercises available.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold mb-1">Listening Practice</h1>
        <p className="text-sm text-muted-foreground">Train your ear with native-speed German</p>
      </div>

      {/* Level selector */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
        {(["A1", "A2", "B1", "B2"] as CEFRLevel[]).map((lvl) => (
          <button
            key={lvl}
            onClick={() => {
              setLevel(lvl);
              setCurrentIdx(0);
              reset();
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

      {/* Progress */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Exercise {currentIdx + 1} of {exercises.length}</span>
        {submitted && (
          <span className="font-semibold">
            {current.questions.filter((q, i) => answers[i] === q.answer).length}/{current.questions.length} correct
          </span>
        )}
      </div>
      <Progress value={((currentIdx + 1) / exercises.length) * 100} className="h-1" />

      {/* Audio player */}
      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-violet-50 via-card to-rose-50 dark:from-violet-950/20 dark:via-card dark:to-rose-950/20 border border-border/60 rounded-2xl p-6"
      >
        <Badge variant="secondary" className="mb-2">{current.topic}</Badge>
        <h2 className="text-lg font-bold mb-1">{current.title}</h2>
        <p className="text-xs text-muted-foreground mb-4">{current.description}</p>

        <button
          onClick={() => speak(current.audioText)}
          disabled={playing}
          className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {playing ? (
            <>
              <div className="flex gap-1 items-end">
                <div className="w-1 h-3 bg-primary-foreground animate-pulse" />
                <div className="w-1 h-5 bg-primary-foreground animate-pulse" style={{ animationDelay: "0.1s" }} />
                <div className="w-1 h-4 bg-primary-foreground animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="w-1 h-6 bg-primary-foreground animate-pulse" style={{ animationDelay: "0.3s" }} />
              </div>
              <span className="text-sm font-medium">Playing...</span>
            </>
          ) : (
            <>
              <Headphones className="w-6 h-6" />
              <span className="text-sm font-medium">Listen ({current.duration})</span>
            </>
          )}
        </button>

        {showTranslation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 p-3 bg-card/60 rounded-lg"
          >
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              English Translation
            </div>
            <p className="text-sm">{current.translation}</p>
          </motion.div>
        )}

        <Button
          onClick={() => setShowTranslation(!showTranslation)}
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-xs"
        >
          {showTranslation ? "Hide translation" : "Show translation"}
        </Button>
      </motion.div>

      {/* Questions */}
      <div className="space-y-4">
        {current.questions.map((q, qi) => (
          <div key={qi} className="bg-card border border-border/60 rounded-xl p-4">
            <p className="text-sm font-medium mb-3">{qi + 1}. {q.question}</p>
            <div className="grid gap-1.5">
              {q.options.map((opt) => {
                const isSelected = answers[qi] === opt;
                const isCorrect = submitted && opt === q.answer;
                const isWrong = submitted && isSelected && opt !== q.answer;
                return (
                  <button
                    key={opt}
                    onClick={() => !submitted && setAnswers({ ...answers, [qi]: opt })}
                    disabled={submitted}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all text-left ${
                      isCorrect
                        ? "border-accent bg-accent/10 text-accent"
                        : isWrong
                        ? "border-rose-400 bg-rose-50 dark:bg-rose-950/30 text-rose-600"
                        : "border-border/60 hover:border-primary/40"
                    }`}
                  >
                    <span>{opt}</span>
                    {isCorrect && <CheckCircle2 className="w-4 h-4" />}
                    {isWrong && <XCircle className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <p className="text-xs text-muted-foreground mt-2 italic">💡 {q.explanation}</p>
            )}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {!submitted ? (
          <Button onClick={submit} className="flex-1" disabled={Object.keys(answers).length !== current.questions.length}>
            Submit Answers
          </Button>
        ) : (
          <>
            <Button onClick={reset} variant="outline" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Retry
            </Button>
            <Button onClick={next} className="flex-1">
              Next Exercise →
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
