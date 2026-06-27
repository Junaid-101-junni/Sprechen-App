"use client";

import { useState, useMemo, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { getQuizByLevel, type CEFRLevel, type QuizQuestion } from "@/lib/german-data";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Trophy,
  RotateCcw,
  ListChecks,
  Volume2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function QuizView() {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const setLevel = useAppStore((s) => s.setLevel);
  const recordQuizResult = useAppStore((s) => s.recordQuizResult);

  const allQuestions = useMemo(() => getQuizByLevel(currentLevel), [currentLevel]);
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => {
    const qs = getQuizByLevel(currentLevel);
    return [...qs].sort(() => Math.random() - 0.5).slice(0, 8);
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [inputAnswer, setInputAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  // Sync questions when allQuestions changes (level switch via parent key remount)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestions([...allQuestions].sort(() => Math.random() - 0.5).slice(0, 8));
  }, [allQuestions]);

  const currentQuestion = questions[currentIdx];

  const normalizeAnswer = (s: string) =>
    s.toLowerCase().trim().replace(/[.,!?;:]/g, "").replace(/\s+/g, " ");

  const checkAnswer = (answer: string) => {
    if (!currentQuestion) return;
    const userAns = normalizeAnswer(answer);
    const correctAns = normalizeAnswer(currentQuestion.answer);
    // For multiple choice / article: exact match
    // For fill-blank / translation: allow flexible match
    let isCorrect: boolean;
    if (currentQuestion.type === "multiple-choice" || currentQuestion.type === "article") {
      isCorrect = userAns === correctAns;
    } else {
      // For fill-blank: check if answer contains key part (first word usually)
      // For translation: check word overlap
      isCorrect = userAns === correctAns ||
        correctAns.includes(userAns) ||
        userAns.includes(correctAns);
    }
    return isCorrect;
  };

  const handleSelect = (option: string) => {
    if (revealed) return;
    setSelectedAnswer(option);
    const isCorrect = checkAnswer(option);
    setRevealed(true);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      toast.success("Correct!", { description: "+10 XP" });
    } else {
      toast.error("Not quite", { description: `Correct: ${currentQuestion.answer}` });
    }
  };

  const handleSubmitInput = () => {
    if (revealed || !inputAnswer.trim()) return;
    const isCorrect = checkAnswer(inputAnswer);
    setSelectedAnswer(inputAnswer);
    setRevealed(true);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      toast.success("Correct!", { description: "+10 XP" });
    } else {
      toast.error("Not quite", { description: `Correct: ${currentQuestion.answer}` });
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedAnswer(null);
      setInputAnswer("");
      setRevealed(false);
    } else {
      // Finished
      setFinished(true);
      const passed = correctCount >= Math.ceil(questions.length * 0.6);
      recordQuizResult(passed);
      if (passed) {
        toast.success("🎉 Quiz Passed!", { description: `You scored ${correctCount}/${questions.length}` });
      } else {
        toast.info("Keep practicing!", { description: `You scored ${correctCount}/${questions.length}` });
      }
    }
  };

  const restart = () => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 8);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setInputAnswer("");
    setRevealed(false);
    setCorrectCount(0);
    setFinished(false);
  };

  if (questions.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <ListChecks className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No quiz questions available for this level yet.</p>
      </div>
    );
  }

  if (finished) {
    const percent = Math.round((correctCount / questions.length) * 100);
    const passed = correctCount >= Math.ceil(questions.length * 0.6);
    return (
      <div className="px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${
            passed ? "bg-accent/15" : "bg-amber-100 dark:bg-amber-950/30"
          }`}>
            <Trophy className={`w-12 h-12 ${passed ? "text-accent" : "text-amber-600"}`} />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-1">
              {passed ? "Quiz Passed!" : "Good Try!"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {passed ? "Du hast es geschafft!" : "Keep practicing and try again."}
            </p>
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-6">
            <div className="text-4xl font-bold tabular-nums mb-1">
              {correctCount}/{questions.length}
            </div>
            <div className="text-sm text-muted-foreground mb-3">{percent}% correct</div>
            <Progress value={percent} className="h-2" />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-accent">{correctCount}</div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-rose-500">{questions.length - correctCount}</div>
                <div className="text-xs text-muted-foreground">Wrong</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={restart} variant="outline" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Try Again
            </Button>
            <Button
              onClick={() => setLevel(currentLevel === "A1" ? "A1" : currentLevel === "A2" ? "A1" : currentLevel === "B1" ? "A2" : "B1")}
              variant="outline"
              className="flex-1"
            >
              <ArrowRight className="w-4 h-4 mr-1.5" />
              Easier
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 text-xs font-medium mb-2">
          <ListChecks className="w-3.5 h-3.5" />
          Quiz Mode
        </div>
        <h2 className="text-xl font-bold">Test your German</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Level {currentLevel} · {questions.length} questions
        </p>
      </div>

      {/* Level + progress */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
        {(["A1", "A2", "B1", "B2"] as CEFRLevel[]).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setLevel(lvl)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              currentLevel === lvl
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground/70 hover:bg-secondary/70"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Question {currentIdx + 1} of {questions.length}</span>
        <span>Score: <span className="font-semibold text-foreground">{correctCount}</span></span>
      </div>
      <Progress value={((currentIdx + (revealed ? 1 : 0)) / questions.length) * 100} className="h-1.5" />

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-card border border-border/60 rounded-2xl p-5"
        >
          <Badge variant="secondary" className="mb-3 text-[10px]">
            {currentQuestion.type === "multiple-choice" && "Multiple Choice"}
            {currentQuestion.type === "fill-blank" && "Fill in the Blank"}
            {currentQuestion.type === "translation" && "Translation"}
            {currentQuestion.type === "article" && "Choose the Article"}
          </Badge>

          <h3 className="text-base font-semibold leading-relaxed mb-4">
            {currentQuestion.question}
          </h3>

          {/* Render answer input based on type */}
          {(currentQuestion.type === "multiple-choice" || currentQuestion.type === "article") && currentQuestion.options && (
            <div className="grid gap-2">
              {currentQuestion.options.map((opt) => {
                const isCorrectOpt = normalizeAnswer(opt) === normalizeAnswer(currentQuestion.answer);
                const isSelected = selectedAnswer === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    disabled={revealed}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border text-left text-sm font-medium transition-all ${
                      revealed && isCorrectOpt
                        ? "border-accent bg-accent/10 text-accent"
                        : revealed && isSelected && !isCorrectOpt
                        ? "border-rose-400 bg-rose-50 dark:bg-rose-950/30 text-rose-600"
                        : "border-border/60 hover:border-primary/40 hover:bg-secondary/40"
                    } ${revealed ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <span>{opt}</span>
                    {revealed && isCorrectOpt && <Check className="w-4 h-4 text-accent" />}
                    {revealed && isSelected && !isCorrectOpt && <X className="w-4 h-4 text-rose-500" />}
                  </button>
                );
              })}
            </div>
          )}

          {(currentQuestion.type === "fill-blank" || currentQuestion.type === "translation") && (
            <div className="space-y-2">
              <Input
                value={inputAnswer}
                onChange={(e) => setInputAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitInput()}
                placeholder="Type your answer..."
                disabled={revealed}
                className="text-base"
              />
              {!revealed && (
                <Button onClick={handleSubmitInput} className="w-full" disabled={!inputAnswer.trim()}>
                  Check Answer
                </Button>
              )}
              {revealed && (
                <div className={`rounded-lg p-3 border ${
                  normalizeAnswer(inputAnswer) === normalizeAnswer(currentQuestion.answer)
                    ? "bg-accent/10 border-accent/40"
                    : "bg-rose-50 dark:bg-rose-950/30 border-rose-300/60"
                }`}>
                  <div className="text-xs font-semibold mb-1">
                    {normalizeAnswer(inputAnswer) === normalizeAnswer(currentQuestion.answer) ? "✓ Correct!" : "✗ Not quite"}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Answer: </span>
                    <span className="font-semibold">{currentQuestion.answer}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Explanation */}
          {revealed && currentQuestion.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 bg-secondary/50 rounded-lg p-3 flex items-start gap-2"
            >
              <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <div className="text-xs text-foreground/80 leading-relaxed">
                {currentQuestion.explanation}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next button */}
      {revealed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button onClick={handleNext} className="w-full" size="lg">
            {currentIdx < questions.length - 1 ? "Next Question" : "See Results"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
