"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore, type SavedWord } from "@/lib/store";
import { useTTS, useSTT } from "@/lib/use-speech";
import { getApiUrl } from "@/lib/api-config";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Loader2,
  Languages,
  History,
  Trash2,
  ArrowRight,
  Lightbulb,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { CEFRLevel } from "@/lib/german-data";

interface WordBreakdownItem {
  word: string;
  english: string;
  type?: string;
  article?: string;
  example?: string;
}

interface TranslationResult {
  germanSentence: string;
  englishTranslation: string;
  wordBreakdown: WordBreakdownItem[];
  culturalNote?: string;
  alternativePhrasings?: string[];
  sourceText: string;
  createdAt: number;
}

const STARTER_PROMPTS: Record<CEFRLevel, string[]> = {
  A1: [
    "I would like a coffee, please.",
    "Where is the train station?",
    "My name is John and I'm from England.",
  ],
  A2: [
    "Can you recommend a good restaurant nearby?",
    "I have had a headache since yesterday.",
    "I'm looking for an apartment to rent.",
  ],
  B1: [
    "I think we should discuss this in more detail.",
    "Could you explain what your company does?",
    "I'd like to share my opinion about the new policy.",
  ],
  B2: [
    "From my perspective, the proposal has several flaws.",
    "I'd like to challenge the assumption behind your argument.",
    "Let's examine the implications of this strategy.",
  ],
};

const ARTICLE_COLORS: Record<string, string> = {
  der: "text-sky-600 dark:text-sky-400",
  die: "text-rose-600 dark:text-rose-400",
  das: "text-emerald-600 dark:text-emerald-400",
};

const TYPE_BADGE_STYLES: Record<string, string> = {
  noun: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  verb: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  adjective: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  adverb: "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
  pronoun: "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300",
  preposition: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  conjunction: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
};

function getTypeBadgeClass(type?: string): string {
  if (!type) return "bg-secondary text-muted-foreground";
  const key = type.toLowerCase().trim();
  return TYPE_BADGE_STYLES[key] || "bg-secondary text-muted-foreground";
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function TranslateView() {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const saveWord = useAppStore((s) => s.saveWord);
  const unsaveWord = useAppStore((s) => s.unsaveWord);
  const savedVocab = useAppStore((s) => s.savedVocab);

  const tts = useTTS({ lang: "de-DE", rate: 0.92 });

  const [inputLang, setInputLang] = useState<"en" | "de">("en");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [history, setHistory] = useState<TranslationResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const baseRef = useRef("");

  const stt = useSTT({
    lang: inputLang === "en" ? "en-US" : "de-DE",
    interimResults: true,
    onResult: (transcript, isFinal) => {
      if (isFinal && transcript.trim()) {
        const next = (baseRef.current + " " + transcript).replace(/\s+/g, " ").trim();
        baseRef.current = next;
        setInput(next);
      }
    },
    onError: (err) => {
      if (err === "not-allowed" || err === "service-not-allowed") {
        toast.error("Microphone access denied. Check your browser permissions.");
      } else if (err !== "no-speech") {
        toast.error(`Mic error: ${err}`);
      }
    },
  });

  // Displayed text in textarea includes live interim transcript for visual feedback
  const displayedInput =
    stt.listening && stt.interimTranscript
      ? (baseRef.current + " " + stt.interimTranscript).replace(/\s+/g, " ").trim()
      : input;

  const isWordSaved = useCallback(
    (german: string) =>
      savedVocab.some((w) => w.german.toLowerCase() === german.toLowerCase()),
    [savedVocab]
  );

  const handleTranslate = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || loading) return;

      setLoading(true);
      setResult(null);

      try {
        const res = await fetch(getApiUrl("/api/translate-sentence"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: content, level: currentLevel }),
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        const translation: TranslationResult = {
          germanSentence: data.germanSentence || "",
          englishTranslation: data.englishTranslation || "",
          wordBreakdown: Array.isArray(data.wordBreakdown) ? data.wordBreakdown : [],
          culturalNote: data.culturalNote,
          alternativePhrasings: Array.isArray(data.alternativePhrasings)
            ? data.alternativePhrasings
            : [],
          sourceText: content,
          createdAt: Date.now(),
        };

        setResult(translation);
        setHistory((h) => [translation, ...h].slice(0, 20));

        // Auto-speak the German sentence
        if (translation.germanSentence && tts.supported) {
          // Slight delay so the UI renders first
          setTimeout(() => {
            tts.speak(translation.germanSentence);
          }, 250);
        }
      } catch (err) {
        console.error(err);
        toast.error("Couldn't translate. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [input, loading, currentLevel, tts]
  );

  // Press-and-hold (PTT) mic handlers
  const micPTTRef = useRef(false);

  const startListening = () => {
    if (stt.listening || micPTTRef.current) return;
    if (!stt.supported) { toast.error("Voice input isn't supported in this browser. Try Chrome."); return; }
    micPTTRef.current = true;
    baseRef.current = input;
    stt.reset();
    const ok = stt.start();
    if (!ok) { micPTTRef.current = false; toast.error("Couldn't start the microphone."); }
  };

  const stopListening = () => {
    if (!micPTTRef.current) return;
    micPTTRef.current = false;
    stt.stop();
  };

  const toggleListening = () => {
    if (stt.listening) { stopListening(); } else { startListening(); }
  };

  const toggleSaveWord = (item: WordBreakdownItem) => {
    const word: SavedWord = {
      german: item.word,
      english: item.english,
      article: (item.article as SavedWord["article"]) || undefined,
      type: item.type,
      example: item.example,
      level: currentLevel,
      savedAt: Date.now(),
    };
    if (isWordSaved(item.word)) {
      unsaveWord(item.word);
      toast.success(`Removed "${item.word}" from saved words`);
    } else {
      saveWord(word);
      toast.success(`Saved "${item.word}" to vocabulary`);
    }
  };

  const clearAll = () => {
    setInput("");
    baseRef.current = "";
    setResult(null);
  };

  const restoreFromHistory = (item: TranslationResult) => {
    setResult(item);
    setShowHistory(false);
    if (item.germanSentence && tts.supported) {
      setTimeout(() => tts.speak(item.germanSentence), 200);
    }
  };

  // Reset base when input lang changes (clears stale interim)
  useEffect(() => {
    if (stt.listening) stt.stop();
    baseRef.current = "";
  }, [inputLang, stt]);

  const starters = STARTER_PROMPTS[currentLevel] || STARTER_PROMPTS.A1;

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium mb-2">
          <Languages className="w-3.5 h-3.5" />
          Sentence Translator
        </div>
        <h2 className="text-xl font-bold">Speak English, get German</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Tap any word to save it · Auto-pronunciation at level {currentLevel}
        </p>
      </div>

      {/* Input card */}
      <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center rounded-lg bg-secondary/60 p-0.5">
            {(["en", "de"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setInputLang(l)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  inputLang === l
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l === "en" ? "🇬🇧 EN" : "🇩🇪 DE"}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {inputLang === "en" ? "Speak or type English" : "Sprich oder tippe Deutsch"}
          </div>
        </div>

        <Textarea
          value={displayedInput}
          onChange={(e) => {
            if (!stt.listening) {
              baseRef.current = e.target.value;
              setInput(e.target.value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleTranslate();
            }
          }}
          placeholder={
            inputLang === "en"
              ? "Type or speak a sentence in English..."
              : "Tippe oder sprich einen Satz auf Deutsch..."
          }
          className="min-h-[88px] max-h-44 resize-none text-sm leading-relaxed"
          rows={3}
        />

        <div className="flex items-center gap-2">
          <Button
            onPointerDown={(e) => { e.preventDefault(); startListening(); }}
            onPointerUp={(e) => { e.preventDefault(); stopListening(); }}
            onPointerLeave={() => stopListening()}
            onPointerCancel={() => stopListening()}
            disabled={!stt.supported}
            variant={stt.listening ? "destructive" : "outline"}
            className="flex-1 rounded-xl select-none touch-none"
          >
            {stt.listening ? (
              <MicOff className="w-4 h-4 mr-1.5" />
            ) : (
              <Mic className="w-4 h-4 mr-1.5" />
            )}
            {stt.listening ? "Release to send" : "Hold to Speak"}
          </Button>

          <Button
            onClick={() => handleTranslate()}
            disabled={!input.trim() || loading}
            className="flex-1 rounded-xl bg-accent hover:bg-accent/90"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-1.5" />
            )}
            Translate
          </Button>

          {(input || result) && (
            <Button
              onClick={clearAll}
              variant="ghost"
              size="icon"
              className="rounded-xl flex-shrink-0"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Mic pulse visualization */}
      <AnimatePresence>
        {stt.listening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full bg-rose-500/40"
                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-rose-500/30"
                animate={{ scale: [1, 1.9, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              />
              <div className="relative w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
                <Mic className="w-7 h-7" />
              </div>
            </div>
            <div className="text-xs font-medium text-rose-600 dark:text-rose-400">
              Listening in {inputLang === "en" ? "English" : "German"}...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Starter prompts */}
      {!result && !loading && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Try one of these starters</span>
          </div>
          <div className="grid gap-1.5">
            {starters.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setInput(s);
                  baseRef.current = s;
                  handleTranslate(s);
                }}
                className="text-left text-sm bg-secondary/50 hover:bg-secondary border border-border/40 rounded-lg px-3 py-2 transition-colors flex items-center justify-between group"
              >
                <span className="flex-1">{s}</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-card border border-border/60 rounded-2xl p-6 text-center"
          >
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
            <p className="text-xs text-muted-foreground mt-2">Translating your sentence...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Translation result */}
      <AnimatePresence mode="wait">
        {result && !loading && (
          <motion.div
            key={result.createdAt}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            {/* German sentence card */}
            <div className="bg-gradient-to-br from-emerald-50 via-card to-teal-50 dark:from-emerald-950/20 dark:via-card dark:to-teal-950/20 border border-border/60 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  German · {currentLevel}
                </div>
                <Button
                  onClick={() => tts.speak(result.germanSentence)}
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-full text-xs"
                >
                  <Volume2 className={`w-3.5 h-3.5 mr-1 ${tts.speaking ? "animate-pulse" : ""}`} />
                  Listen
                </Button>
              </div>
              <p className="text-lg font-semibold leading-snug">{result.germanSentence}</p>
              <div className="mt-2 pt-2 border-t border-border/40">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                  {inputLang === "en" ? "You said" : "English"}
                </div>
                <p className="text-sm text-muted-foreground">{result.englishTranslation}</p>
              </div>
            </div>

            {/* Word-by-word breakdown */}
            {result.wordBreakdown.length > 0 && (
              <div className="bg-card border border-border/60 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Word Breakdown
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Tap <Bookmark className="inline w-3 h-3 align-text-bottom" /> to save
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.wordBreakdown.map((item, idx) => {
                    const saved = isWordSaved(item.word);
                    return (
                      <motion.div
                        key={`${item.word}-${idx}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                        className="group inline-flex items-center gap-1 bg-secondary/60 hover:bg-secondary border border-border/50 rounded-lg pl-2 pr-1 py-1 transition-colors"
                      >
                        <button
                          onClick={() => tts.speak(item.word)}
                          className="flex items-center gap-1"
                          title={`Hear "${item.word}"`}
                        >
                          {item.article && (
                            <span className={`text-[11px] font-semibold ${ARTICLE_COLORS[item.article.toLowerCase()] || "text-muted-foreground"}`}>
                              {item.article}
                            </span>
                          )}
                          <span className="text-sm font-medium">{item.word}</span>
                        </button>
                        {item.type && (
                          <Badge variant="secondary" className={`h-4 px-1 text-[9px] rounded ${getTypeBadgeClass(item.type)}`}>
                            {item.type}
                          </Badge>
                        )}
                        <button
                          onClick={() => toggleSaveWord(item)}
                          className={`ml-0.5 p-0.5 rounded transition-colors ${
                            saved
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          title={saved ? "Remove from saved" : "Save to vocabulary"}
                        >
                          {saved ? (
                            <BookmarkCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Word detail popover-ish inline */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {result.wordBreakdown
                    .filter((w) => w.english || w.example)
                    .slice(0, 6)
                    .map((item, idx) => (
                      <div
                        key={`detail-${item.word}-${idx}`}
                        className="flex items-start gap-2 bg-background/60 rounded-lg p-2"
                      >
                        <button
                          onClick={() => tts.speak(item.word)}
                          className="mt-0.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold flex items-center gap-1.5">
                            {item.article && (
                              <span className={ARTICLE_COLORS[item.article.toLowerCase()] || "text-muted-foreground"}>
                                {item.article}
                              </span>
                            )}
                            {item.word}
                            <span className="text-muted-foreground font-normal">— {item.english}</span>
                          </div>
                          {item.example && (
                            <div className="text-[11px] text-muted-foreground mt-0.5 italic line-clamp-2">
                              {item.example}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Cultural note */}
            {result.culturalNote && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
                      Cultural Note
                    </div>
                    <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                      {result.culturalNote}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Alternative phrasings */}
            {result.alternativePhrasings && result.alternativePhrasings.length > 0 && (
              <div className="bg-card border border-border/60 rounded-2xl p-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Other ways to say it
                </div>
                <div className="space-y-1.5">
                  {result.alternativePhrasings.map((alt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 bg-secondary/40 rounded-lg px-3 py-2"
                    >
                      <span className="text-sm flex-1">{alt}</span>
                      <button
                        onClick={() => tts.speak(alt)}
                        className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action bar */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => tts.speak(result.germanSentence)}
                variant="outline"
                size="sm"
                className="flex-1 rounded-xl"
              >
                <Volume2 className="w-3.5 h-3.5 mr-1.5" />
                Replay
              </Button>
              <Button
                onClick={() => {
                  setInput(result.sourceText);
                  baseRef.current = result.sourceText;
                  setResult(null);
                }}
                variant="outline"
                size="sm"
                className="flex-1 rounded-xl"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
          <div
            onClick={() => setShowHistory((s) => !s)}
            className="w-full flex items-center justify-between p-3 hover:bg-secondary/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">History</span>
              <Badge variant="secondary" className="text-[10px]">
                {history.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {stt.listening || loading ? null : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setHistory([]);
                    toast.success("History cleared");
                  }}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  title="Clear history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <ArrowRight
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  showHistory ? "rotate-90" : ""
                }`}
              />
            </div>
          </div>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-border/40 max-h-80 overflow-y-auto scrollbar-thin"
              >
                <div className="divide-y divide-border/30">
                  {history.map((h, idx) => (
                    <button
                      key={idx}
                      onClick={() => restoreFromHistory(h)}
                      className="w-full text-left p-3 hover:bg-secondary/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-muted-foreground truncate">
                            {h.sourceText}
                          </div>
                          <div className="text-sm font-medium truncate mt-0.5">
                            {h.germanSentence}
                          </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatRelative(h.createdAt)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
