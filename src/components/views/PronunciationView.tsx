"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { VOCABULARY, type VocabWord } from "@/lib/german-data";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  RefreshCw,
  Check,
  AlertCircle,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// Minimal type for webkitSpeechRecognition
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

// Simple similarity: 0-100 (Levenshtein-based)
function similarity(a: string, b: string): number {
  const s1 = a.toLowerCase().trim().replace(/[.,!?;:]/g, "");
  const s2 = b.toLowerCase().trim().replace(/[.,!?;:]/g, "");
  if (s1 === s2) return 100;
  if (!s1.length || !s2.length) return 0;
  // Token overlap
  const t1 = new Set(s1.split(/\s+/));
  const t2 = new Set(s2.split(/\s+/));
  const intersection = [...t1].filter((x) => t2.has(x)).length;
  const union = new Set([...t1, ...t2]).size;
  const jaccard = intersection / union;
  // Combine with character-level
  const longer = s1.length >= s2.length ? s1 : s2;
  const shorter = s1.length >= s2.length ? s2 : s1;
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer[i] === shorter[i]) matches++;
  }
  const charSim = matches / longer.length;
  return Math.round((jaccard * 0.6 + charSim * 0.4) * 100);
}

export function PronunciationView() {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const recordPronunciation = useAppStore((s) => s.recordPronunciation);
  const pronunciationAttempts = useAppStore((s) => s.pronunciationAttempts);

  const [words, setWords] = useState<VocabWord[]>(() => {
    const pool = VOCABULARY.filter((w) => w.level === currentLevel && w.german.split(" ").length <= 3);
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 20);
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Check browser support on mount only - legitimate one-time capability check
  useEffect(() => {
    const r = getRecognition();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(!!r);
    return () => {
      try { r?.abort(); } catch { /* noop */ }
    };
  }, []);

  const currentWord = words[currentIdx];

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 0.8;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const r = getRecognition();
    if (!r) {
      toast.error("Speech recognition not supported in this browser. Try Chrome.");
      return;
    }
    r.lang = "de-DE";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.continuous = false;

    r.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setHeard(transcript);
      const sim = similarity(transcript, currentWord?.german || "");
      setScore(sim);
      recordPronunciation();
      if (sim >= 80) {
        toast.success(`Excellent! ${sim}% match`);
      } else if (sim >= 60) {
        toast.info(`Good try! ${sim}% match - keep practicing`);
      } else {
        toast.warning(`Heard: "${transcript}". Try again!`);
      }
    };
    r.onerror = (event) => {
      toast.error(`Mic error: ${event.error}`);
      setIsListening(false);
    };
    r.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = r;
    try {
      r.start();
      setIsListening(true);
      setHeard("");
      setScore(null);
    } catch {
      toast.error("Couldn't start microphone.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const nextWord = () => {
    setHeard("");
    setScore(null);
    setCurrentIdx((i) => (i + 1) % words.length);
  };

  if (!currentWord) {
    return (
      <div className="px-4 py-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-2">Loading words...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-medium mb-2">
          <Mic className="w-3.5 h-3.5" />
          Pronunciation Coach
        </div>
        <h2 className="text-xl font-bold">Speak German with confidence</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Listen, repeat, and get instant AI feedback
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card border border-border/50 rounded-lg p-2.5 text-center">
          <div className="text-[10px] text-muted-foreground uppercase">Attempts</div>
          <div className="text-lg font-bold tabular-nums">{pronunciationAttempts}</div>
        </div>
        <div className="bg-card border border-border/50 rounded-lg p-2.5 text-center">
          <div className="text-[10px] text-muted-foreground uppercase">Word</div>
          <div className="text-lg font-bold tabular-nums">{currentIdx + 1}/{words.length}</div>
        </div>
        <div className="bg-card border border-border/50 rounded-lg p-2.5 text-center">
          <div className="text-[10px] text-muted-foreground uppercase">Last Score</div>
          <div className="text-lg font-bold tabular-nums">{score ?? "—"}</div>
        </div>
      </div>

      {!supported && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300">
            <strong>Speech recognition unavailable.</strong> Use Chrome or Edge for the full experience.
            You can still tap the word to hear it pronounced.
          </div>
        </div>
      )}

      {/* Word card */}
      <motion.div
        key={currentIdx}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gradient-to-br from-rose-50 via-card to-amber-50 dark:from-rose-950/20 dark:via-card dark:to-amber-950/20 border border-border/60 rounded-2xl p-6"
      >
        <div className="text-center">
          {currentWord.article && (
            <div className="text-lg text-muted-foreground mb-1">{currentWord.article}</div>
          )}
          <h2 className="text-3xl font-bold mb-2">{currentWord.german}</h2>
          <div className="text-sm text-muted-foreground mb-1">{currentWord.english}</div>
          {currentWord.ipa && (
            <div className="text-xs font-mono text-muted-foreground">/{currentWord.ipa}/</div>
          )}

          <Button
            onClick={() => speak(currentWord.german)}
            variant="outline"
            className="mt-4 rounded-full"
            size="sm"
          >
            <Volume2 className="w-4 h-4 mr-1.5" />
            Listen
          </Button>

          <div className="mt-4 bg-card/60 rounded-lg p-3 text-left">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Example
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sm flex-1">{currentWord.example.de}</span>
              <button onClick={() => speak(currentWord.example.de)} className="text-primary">
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{currentWord.example.en}</div>
          </div>
        </div>
      </motion.div>

      {/* Mic button - press and hold */}
      <div className="flex flex-col items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onPointerDown={(e) => { e.preventDefault(); startListening(); }}
          onPointerUp={(e) => { e.preventDefault(); stopListening(); }}
          onPointerLeave={() => stopListening()}
          onPointerCancel={() => stopListening()}
          disabled={!supported}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all select-none touch-none ${
            isListening
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-110"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg active:scale-95"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isListening && (
            <motion.div
              className="absolute inset-0 rounded-full bg-rose-500/30"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </motion.button>
        <div className="text-xs font-medium text-muted-foreground">
          {isListening ? <span className="text-rose-500">🔴 Recording... Release to stop</span> : "Press & hold to speak"}
        </div>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {heard && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card border border-border/60 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Result</div>
              {score !== null && (
                <Badge
                  variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Try Again"}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-[10px] text-muted-foreground">You said:</div>
                <div className="text-sm font-medium">{heard}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">Target:</div>
                <div className="text-sm font-medium">{currentWord.german}</div>
              </div>
              {score !== null && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Match Score
                    </span>
                    <span className="font-semibold tabular-nums">{score}%</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                onClick={() => {
                  setHeard("");
                  setScore(null);
                }}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Retry
              </Button>
              <Button onClick={nextWord} size="sm" className="flex-1 bg-accent hover:bg-accent/90">
                <Check className="w-3.5 h-3.5 mr-1" />
                Next
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip */}
      <div className="flex justify-center">
        <Button onClick={nextWord} variant="ghost" size="sm">
          Skip this word →
        </Button>
      </div>
    </div>
  );
}
