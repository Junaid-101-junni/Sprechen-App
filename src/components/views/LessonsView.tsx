"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { getDialoguesByLevel, type Dialogue, type CEFRLevel } from "@/lib/german-data";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ChevronLeft, BookOpen, MessageCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function LessonsView() {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const setLevel = useAppStore((s) => s.setLevel);
  const recordDialogue = useAppStore((s) => s.recordDialogue);
  const [selectedDialogue, setSelectedDialogue] = useState<Dialogue | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const dialogues = useMemo(() => getDialoguesByLevel(currentLevel), [currentLevel]);

  const speak = (text: string, lang = "de-DE") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const playFullDialogue = (dialogue: Dialogue) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    dialogue.lines.forEach((line, idx) => {
      const u = new SpeechSynthesisUtterance(line.text);
      u.lang = "de-DE";
      u.rate = 0.85;
      u.onstart = () => {
        // Could highlight current line - skipping for simplicity
      };
      setTimeout(() => window.speechSynthesis.speak(u), idx * 3500);
    });
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
    const dialogue = selectedDialogue!;
    const correct = dialogue.comprehensionQuestions?.filter((q, i) => quizAnswers[i] === q.answer).length ?? 0;
    const total = dialogue.comprehensionQuestions?.length ?? 0;
    if (correct === total) {
      recordDialogue();
      toast.success(`Perfect! ${correct}/${total} correct · +30 XP`);
    } else {
      toast.info(`${correct}/${total} correct · Try again!`);
    }
  };

  if (selectedDialogue) {
    return (
      <div className="px-4 py-4 space-y-4">
        <button
          onClick={() => {
            setSelectedDialogue(null);
            setShowQuiz(false);
            setQuizSubmitted(false);
            setQuizAnswers({});
          }}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to lessons
        </button>

        <div>
          <Badge variant="secondary" className="mb-2">{currentLevel} · Dialogue</Badge>
          <h1 className="text-xl font-bold">{selectedDialogue.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{selectedDialogue.scenario}</p>
          <p className="text-xs text-muted-foreground">📍 {selectedDialogue.setting}</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => playFullDialogue(selectedDialogue)} size="sm" className="bg-accent hover:bg-accent/90">
            <Volume2 className="w-4 h-4 mr-1.5" />
            Play Full Dialogue
          </Button>
          <Button onClick={() => setShowQuiz(!showQuiz)} variant="outline" size="sm">
            <MessageCircle className="w-4 h-4 mr-1.5" />
            {showQuiz ? "Hide Quiz" : "Show Comprehension Quiz"}
          </Button>
        </div>

        {/* Dialogue lines */}
        <div className="space-y-3">
          {selectedDialogue.lines.map((line, i) => {
            const isLeft = line.speaker === selectedDialogue.lines[0].speaker || i % 2 === 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isLeft ? -8 : 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex ${isLeft ? "justify-start" : "justify-end"}`}
              >
                <div className={`max-w-[85%] ${isLeft ? "items-start" : "items-end"} flex flex-col`}>
                  <div className="text-[10px] text-muted-foreground mb-1 px-1 font-medium">
                    {line.speaker}
                  </div>
                  <div className={`rounded-2xl px-3.5 py-2.5 ${
                    isLeft
                      ? "bg-secondary rounded-bl-md"
                      : "bg-primary text-primary-foreground rounded-br-md"
                  }`}>
                    <div className="flex items-start gap-2">
                      <span className="text-sm flex-1">{line.text}</span>
                      <button
                        onClick={() => speak(line.text)}
                        className="flex-shrink-0 opacity-70 hover:opacity-100"
                        aria-label="Listen"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className={`text-[11px] mt-1 ${isLeft ? "text-muted-foreground" : "text-primary-foreground/80"}`}>
                      {line.translation}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Vocabulary */}
        <div className="bg-secondary/50 border border-border/50 rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            Key Vocabulary
          </h3>
          <div className="space-y-2">
            {selectedDialogue.vocabulary.map((v, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-sm">
                <button
                  onClick={() => speak(v.german)}
                  className="flex items-center gap-2 flex-1 text-left hover:text-primary"
                >
                  <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-medium">{v.german}</span>
                </button>
                <span className="text-muted-foreground text-xs">{v.english}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comprehension Quiz */}
        <AnimatePresence>
          {showQuiz && selectedDialogue.comprehensionQuestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card border border-border/60 rounded-xl p-4 space-y-4"
            >
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                Comprehension Questions
              </h3>
              {selectedDialogue.comprehensionQuestions.map((q, qi) => (
                <div key={qi}>
                  <p className="text-sm font-medium mb-2">{qi + 1}. {q.question}</p>
                  <div className="grid gap-1.5">
                    {q.options?.map((opt) => {
                      const isSelected = quizAnswers[qi] === opt;
                      const isCorrect = quizSubmitted && opt === q.answer;
                      const isWrong = quizSubmitted && isSelected && opt !== q.answer;
                      return (
                        <button
                          key={opt}
                          onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [qi]: opt })}
                          disabled={quizSubmitted}
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
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {!quizSubmitted ? (
                <Button onClick={submitQuiz} className="w-full">
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizAnswers({});
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dialogue Lessons</h1>
        <p className="text-sm text-muted-foreground">
          Real-life German conversations with audio and quizzes
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

      <div className="text-xs text-muted-foreground">
        {dialogues.length} dialogues for level {currentLevel}
      </div>

      {/* Dialogue cards */}
      <div className="space-y-3">
        {dialogues.map((dialogue, i) => (
          <motion.button
            key={dialogue.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => {
              setSelectedDialogue(dialogue);
              setShowQuiz(false);
              setQuizSubmitted(false);
              setQuizAnswers({});
            }}
            className="w-full bg-card border border-border/60 rounded-xl p-4 text-left hover:border-primary/40 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="font-semibold text-sm">{dialogue.title}</h3>
                <p className="text-xs text-muted-foreground">{dialogue.scenario}</p>
              </div>
              <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                📍 {dialogue.setting.split(" ")[0]}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {dialogue.lines.length} lines
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {dialogue.vocabulary.length} words
              </span>
              {dialogue.comprehensionQuestions && (
                <span>· {dialogue.comprehensionQuestions.length} questions</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {dialogue.tags?.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
