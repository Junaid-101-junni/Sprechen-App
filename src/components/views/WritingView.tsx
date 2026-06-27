"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import type { CEFRLevel } from "@/lib/german-data";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Send, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getApiUrl } from "@/lib/api-config";
import { toast } from "sonner";

interface WritingPrompt {
  level: CEFRLevel;
  prompt: string;
  hint: string;
  minWords: number;
}

const PROMPTS: WritingPrompt[] = [
  { level: "A1", prompt: "Introduce yourself: name, age, where you live, what you do.", hint: "Use: ich heiße, ich bin, ich wohne, ich arbeite/lerne", minWords: 30 },
  { level: "A1", prompt: "Describe your family.", hint: "Use: ich habe, mein/meine, Bruder, Schwester, Eltern", minWords: 30 },
  { level: "A2", prompt: "What did you do last weekend? (Use Perfekt)", hint: "Use: ich habe...gemacht, ich bin...gegangen", minWords: 50 },
  { level: "A2", prompt: "Describe your typical daily routine.", hint: "Use: morgens, dann, danach, abends + reflexive verbs", minWords: 50 },
  { level: "B1", prompt: "What's your opinion on remote work?", hint: "Use: meiner Meinung nach, ich denke dass, weil, deshalb", minWords: 80 },
  { level: "B1", prompt: "Describe a memorable trip you took.", hint: "Use: Präteritum/Perfekt, als, dann, plötzlich", minWords: 80 },
  { level: "B2", prompt: "Discuss the pros and cons of social media.", hint: "Use: einerseits, andererseits, jedoch, darüber hinaus", minWords: 100 },
  { level: "B2", prompt: "Should AI be regulated? Argue your position.", hint: "Use: Passiversatz, Konjunktiv II, Modalpartikeln", minWords: 120 },
];

interface Feedback {
  overallScore?: number;
  levelAssessment?: string;
  corrections?: { original: string; corrected: string; explanation: string }[];
  strengths?: string[];
  improvements?: string[];
  rewrittenText?: string;
  grammarTips?: string[];
  vocabularySuggestions?: string[];
  raw?: string;
}

export function WritingView() {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const setLevel = useAppStore((s) => s.setLevel);
  const recordWriting = useAppStore((s) => s.recordWriting);

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0);

  const levelPrompts = PROMPTS.filter((p) => p.level === currentLevel);
  const currentPrompt = levelPrompts[selectedPromptIdx] || levelPrompts[0];

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const submit = async () => {
    if (!text.trim()) {
      toast.error("Please write something first");
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(getApiUrl("/api/writing"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          level: currentLevel,
          prompt: currentPrompt?.prompt,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setFeedback(data);
      recordWriting();
      toast.success("Feedback ready! +25 XP");
    } catch {
      toast.error("Couldn't analyze your writing. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setText("");
    setFeedback(null);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold mb-1">Writing Practice</h1>
        <p className="text-sm text-muted-foreground">Get AI feedback on your German writing</p>
      </div>

      {/* Level selector */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
        {(["A1", "A2", "B1", "B2"] as CEFRLevel[]).map((lvl) => (
          <button
            key={lvl}
            onClick={() => {
              setLevel(lvl);
              setSelectedPromptIdx(0);
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

      {/* Prompt selection */}
      <div className="bg-gradient-to-br from-emerald-50 via-card to-primary/5 dark:from-emerald-950/20 dark:via-card dark:to-primary/5 border border-border/60 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <PenLine className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prompt</span>
        </div>
        <p className="text-sm font-medium mb-2">{currentPrompt?.prompt}</p>
        <div className="text-xs text-muted-foreground bg-card/60 rounded p-2">
          💡 <strong>Hint:</strong> {currentPrompt?.hint}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Target: {currentPrompt?.minWords}+ words
        </div>
        {levelPrompts.length > 1 && (
          <div className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-thin">
            {levelPrompts.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedPromptIdx(i);
                  reset();
                }}
                className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${
                  selectedPromptIdx === i ? "bg-primary text-primary-foreground" : "bg-secondary"
                }`}
              >
                Prompt {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Text area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Schreib hier auf Deutsch..."
            className="min-h-[180px] text-sm"
            disabled={loading}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className={wordCount >= (currentPrompt?.minWords ?? 0) ? "text-accent" : "text-muted-foreground"}>
            {wordCount} / {currentPrompt?.minWords} words
          </span>
          {text && (
            <button onClick={reset} className="text-muted-foreground hover:text-foreground">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Submit button */}
      <Button
        onClick={submit}
        disabled={loading || !text.trim()}
        className="w-full bg-accent hover:bg-accent/90"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            AI is analyzing...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Get AI Feedback
          </>
        )}
      </Button>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Score */}
            {typeof feedback.overallScore === "number" && (
              <div className="bg-card border border-border/60 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overall Score</span>
                  <span className={`text-2xl font-bold ${
                    feedback.overallScore >= 80 ? "text-accent" : feedback.overallScore >= 60 ? "text-amber-600" : "text-rose-600"
                  }`}>
                    {feedback.overallScore}/100
                  </span>
                </div>
                {feedback.levelAssessment && (
                  <p className="text-xs text-muted-foreground">{feedback.levelAssessment}</p>
                )}
              </div>
            )}

            {/* Corrections */}
            {feedback.corrections && feedback.corrections.length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4" />
                  Corrections ({feedback.corrections.length})
                </h3>
                <div className="space-y-3">
                  {feedback.corrections.map((c, i) => (
                    <div key={i} className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="line-through text-rose-600">{c.original}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-accent font-medium">{c.corrected}</span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-3">{c.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {feedback.strengths && feedback.strengths.length > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  What you did well
                </h3>
                <ul className="space-y-1">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-foreground/80 flex gap-2">
                      <span className="text-emerald-600">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {feedback.improvements && feedback.improvements.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <Sparkles className="w-4 h-4" />
                  Suggestions for improvement
                </h3>
                <ul className="space-y-1">
                  {feedback.improvements.map((imp, i) => (
                    <li key={i} className="text-xs text-foreground/80 flex gap-2">
                      <span className="text-amber-600">→</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rewritten text */}
            {feedback.rewrittenText && (
              <div className="bg-card border border-border/60 rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-2">Rewritten version</h3>
                <p className="text-sm leading-relaxed">{feedback.rewrittenText}</p>
              </div>
            )}

            {/* Grammar tips */}
            {feedback.grammarTips && feedback.grammarTips.length > 0 && (
              <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/40 rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-2 text-violet-700 dark:text-violet-300">📚 Grammar Tips</h3>
                <ul className="space-y-1">
                  {feedback.grammarTips.map((tip, i) => (
                    <li key={i} className="text-xs text-foreground/80">• {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Vocabulary suggestions */}
            {feedback.vocabularySuggestions && feedback.vocabularySuggestions.length > 0 && (
              <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/40 rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-2 text-teal-700 dark:text-teal-300">💡 Better word choices</h3>
                <ul className="space-y-1">
                  {feedback.vocabularySuggestions.map((v, i) => (
                    <li key={i} className="text-xs text-foreground/80">• {v}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Raw fallback */}
            {feedback.raw && (
              <div className="bg-card border border-border/60 rounded-xl p-4">
                <p className="text-sm whitespace-pre-wrap">{feedback.raw}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
