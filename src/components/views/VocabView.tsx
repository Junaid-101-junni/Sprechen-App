"use client";

import { useState, useMemo, useEffect } from "react";
import { useAppStore, type Quality } from "@/lib/store";
import {
  getWordsByLevel,
  getCoreWordsByLevel,
  CATEGORY_LABELS,
  VOCAB_STATS,
  type VocabWord,
  type CEFRLevel,
  type WordCategory,
} from "@/lib/german-data";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  Check,
  X,
  RotateCcw,
  Brain,
  Lightbulb,
  Loader2,
  Layers,
  Search,
  TrendingUp,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api-config";

type SortMode = "frequency" | "due" | "category" | "alphabetical";

export function VocabView() {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const setLevel = useAppStore((s) => s.setLevel);
  const sm2Cards = useAppStore((s) => s.sm2Cards);
  const reviewWord = useAppStore((s) => s.reviewWord);
  const saveWord = useAppStore((s) => s.saveWord);
  const unsaveWord = useAppStore((s) => s.unsaveWord);
  const savedVocab = useAppStore((s) => s.savedVocab);

  const savedSet = new Set(savedVocab.map((w) => w.german.toLowerCase()));

  const handleSaveWord = (word: VocabWord) => {
    const isSaved = savedSet.has(word.german.toLowerCase());
    if (isSaved) {
      unsaveWord(word.german);
      toast.success(`Removed "${word.german}" from saved`);
    } else {
      saveWord({
        german: word.german,
        english: word.english,
        article: word.article,
        type: word.category === "verbs" ? "verb" : word.category === "adjectives" ? "adjective" : "noun",
        example: word.example?.de,
        context: "vocab",
        level: word.level,
        savedAt: Date.now(),
      });
      toast.success(`Saved "${word.german}" to vocabulary`);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<WordCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCoreOnly, setShowCoreOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("frequency");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [explanation, setExplanation] = useState<unknown>(null);
  const [loadingExplain, setLoadingExplain] = useState(false);

  const allLevelWords = useMemo(
    () => getWordsByLevel(currentLevel),
    [currentLevel]
  );

  const filteredWords = useMemo(() => {
    let pool = allLevelWords;
    if (showCoreOnly) {
      pool = getCoreWordsByLevel(currentLevel);
    }
    if (selectedCategory !== "all") {
      pool = pool.filter((w) => w.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pool = pool.filter(
        (w) =>
          w.german.toLowerCase().includes(q) ||
          w.english.toLowerCase().includes(q)
      );
    }
    return pool;
  }, [allLevelWords, currentLevel, selectedCategory, searchQuery, showCoreOnly]);

  // Sort by mode
  const prioritizedWords = useMemo(() => {
    const withMeta = filteredWords.map((w) => {
      const card = sm2Cards[w.id];
      return {
        word: w,
        card,
        dueTime: card?.nextReview ?? 0,
        isDue: card && card.status !== "new" && card.nextReview <= Date.now(),
        isNew: !card,
        frequency: w.frequency ?? 100,
      };
    });

    if (sortMode === "frequency") {
      return withMeta.sort((a, b) => a.frequency - b.frequency).map((x) => x.word);
    }
    if (sortMode === "due") {
      // Due first, then new, then by nextReview
      return withMeta.sort((a, b) => {
        if (a.isDue && !b.isDue) return -1;
        if (!a.isDue && b.isDue) return 1;
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return a.dueTime - b.dueTime;
      }).map((x) => x.word);
    }
    if (sortMode === "alphabetical") {
      return withMeta.sort((a, b) => a.word.german.localeCompare(b.word.german)).map((x) => x.word);
    }
    // category
    return withMeta.sort((a, b) => a.word.category.localeCompare(b.word.category)).map((x) => x.word);
  }, [filteredWords, sm2Cards, sortMode]);

  useEffect(() => {
    setCurrentIndex(0);
    setFlipped(false);
    setExplanation(null);
  }, [currentLevel, selectedCategory, searchQuery, showCoreOnly, sortMode]);

  const currentWord: VocabWord | undefined = prioritizedWords[currentIndex];

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleResult = (quality: Quality) => {
    if (!currentWord) return;
    reviewWord(currentWord.id, quality);
    const xpGain = quality >= 4 ? 15 : quality >= 3 ? 10 : quality >= 2 ? 3 : 1;
    toast.success(quality >= 3 ? `Got it! +${xpGain} XP` : `Will review soon. +${xpGain} XP`);
    setTimeout(() => {
      setFlipped(false);
      setExplanation(null);
      if (currentIndex < prioritizedWords.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        toast.info("🎉 Set complete!", { description: "You reviewed all words in this set." });
        setCurrentIndex(0);
      }
    }, 250);
  };

  const loadExplanation = async () => {
    if (!currentWord || explanation) return;
    setLoadingExplain(true);
    try {
      const res = await fetch(getApiUrl("/api/explain"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: currentWord.german, level: currentLevel, english: currentWord.english }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setExplanation(data);
    } catch {
      toast.error("Couldn't load AI explanation.");
    } finally {
      setLoadingExplain(false);
    }
  };

  const categories = Array.from(new Set(allLevelWords.map((w) => w.category)));
  const card = currentWord ? sm2Cards[currentWord.id] : undefined;
  const dueCount = Object.values(sm2Cards).filter((c) => c.status !== "new" && c.nextReview <= Date.now()).length;

  if (!currentWord) {
    return (
      <div className="px-4 py-8 text-center">
        <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No words match your filter.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-card border border-border/50 rounded-lg p-2">
          <div className="text-[10px] uppercase text-muted-foreground">Total</div>
          <div className="text-sm font-bold">{VOCAB_STATS[currentLevel].total}</div>
        </div>
        <div className="bg-card border border-border/50 rounded-lg p-2">
          <div className="text-[10px] uppercase text-muted-foreground">Core</div>
          <div className="text-sm font-bold">{VOCAB_STATS[currentLevel].core}</div>
        </div>
        <div className="bg-card border border-border/50 rounded-lg p-2">
          <div className="text-[10px] uppercase text-muted-foreground">Learned</div>
          <div className="text-sm font-bold">{Object.keys(sm2Cards).length}</div>
        </div>
        <div className="bg-card border border-border/50 rounded-lg p-2">
          <div className="text-[10px] uppercase text-muted-foreground">Due</div>
          <div className="text-sm font-bold text-primary">{dueCount}</div>
        </div>
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search words..."
          className="pl-9 text-sm"
        />
      </div>

      {/* Sort mode + core toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1 bg-secondary/60 rounded-lg p-1">
          {([
            { k: "frequency", label: "Common", icon: TrendingUp },
            { k: "due", label: "Due", icon: Clock },
            { k: "alphabetical", label: "A-Z", icon: Search },
            { k: "category", label: "Topic", icon: Layers },
          ] as const).map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.k}
                onClick={() => setSortMode(m.k)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  sortMode === m.k ? "bg-card shadow-sm" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-3 h-3" />
                {m.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowCoreOnly(!showCoreOnly)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${
            showCoreOnly ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
          }`}
        >
          <Star className="w-3 h-3 inline mr-1" />
          {showCoreOnly ? "Core only" : "All words"}
        </button>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            selectedCategory === "all"
              ? "bg-accent text-accent-foreground"
              : "bg-secondary/70 text-foreground/70 hover:bg-secondary"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? "bg-accent text-accent-foreground"
                : "bg-secondary/70 text-foreground/70 hover:bg-secondary"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Card {currentIndex + 1} of {prioritizedWords.length}
        </div>
        {card && (
          <Badge variant="outline" className="text-[10px]">
            {card.status === "new" && "🆕 New"}
            {card.status === "learning" && "📚 Learning"}
            {card.status === "review" && `🔄 Due in ${Math.max(0, Math.ceil((card.nextReview - Date.now()) / 86400000))}d`}
            {card.status === "mastered" && "✓ Mastered"}
            {card && card.repetitions > 0 && ` · ${card.repetitions}✓`}
          </Badge>
        )}
      </div>

      {/* Flashcard */}
      <div
        className="flip-card relative h-[440px] cursor-pointer select-none"
        onClick={() => setFlipped((f) => !f)}
      >
        <div className={`flip-card-inner relative w-full h-full ${flipped ? "flipped" : ""}`}>
          {/* Front - German + English + Plural */}
          <div className="flip-card-face absolute inset-0 bg-card border border-border/60 rounded-2xl shadow-sm flex flex-col items-center justify-center p-6 overflow-y-auto scrollbar-thin">
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {CATEGORY_LABELS[currentWord.category]}
              </Badge>
              {currentWord.frequency && currentWord.frequency < 30 && (
                <Badge variant="outline" className="text-[10px]">
                  <Star className="w-3 h-3 mr-1" />
                  Top {currentWord.frequency}
                </Badge>
              )}
            </div>
            {/* Save button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSaveWord(currentWord);
              }}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                savedSet.has(currentWord.german.toLowerCase())
                  ? "text-accent"
                  : "text-muted-foreground hover:text-accent"
              }`}
              title={savedSet.has(currentWord.german.toLowerCase()) ? "Remove from saved" : "Save word"}
            >
              {savedSet.has(currentWord.german.toLowerCase())
                ? <BookmarkCheck className="w-5 h-5" />
                : <Bookmark className="w-5 h-5" />}
            </button>

            <div className="text-center mt-4">
              {currentWord.article && (
                <div className="text-2xl font-semibold text-muted-foreground mb-1">
                  {currentWord.article}
                </div>
              )}
              <h2 className="text-4xl font-bold mb-2">{currentWord.german}</h2>
              {currentWord.ipa && (
                <div className="text-sm text-muted-foreground font-mono mb-2">/{currentWord.ipa}/</div>
              )}
              {/* English translation on front */}
              <div className="text-lg text-primary font-medium mb-3">
                {currentWord.english}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speak(currentWord.german);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                Listen
              </button>
              {/* Plural form prominently displayed */}
              {currentWord.plural && (
                <div className="mt-4 bg-secondary/60 rounded-lg px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Plural</div>
                  <div className="text-sm font-medium">die {currentWord.plural}</div>
                </div>
              )}
            </div>
          </div>

          {/* Back - English + example + conjugation */}
          <div className="flip-card-face flip-card-back absolute inset-0 bg-gradient-to-br from-primary/8 via-card to-accent/8 border border-border/60 rounded-2xl shadow-sm flex flex-col p-5 overflow-y-auto scrollbar-thin">
            {/* Save button on back too */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSaveWord(currentWord);
              }}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                savedSet.has(currentWord.german.toLowerCase())
                  ? "text-accent"
                  : "text-muted-foreground hover:text-accent"
              }`}
              title={savedSet.has(currentWord.german.toLowerCase()) ? "Remove from saved" : "Save word"}
            >
              {savedSet.has(currentWord.german.toLowerCase())
                ? <BookmarkCheck className="w-5 h-5" />
                : <Bookmark className="w-5 h-5" />}
            </button>
            <div className="flex-1 flex flex-col">
              <div className="text-center mb-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  English
                </div>
                <h3 className="text-xl font-bold">{currentWord.english}</h3>
              </div>

              {currentWord.example.de && (
                <div className="bg-secondary/50 rounded-lg p-3 mb-2 text-left">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Example
                  </div>
                  <div className="text-sm font-medium mb-1 flex items-start gap-2">
                    <span className="flex-1">{currentWord.example.de}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(currentWord.example.de);
                      }}
                      className="text-primary hover:scale-110 transition-transform flex-shrink-0"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground">{currentWord.example.en}</div>
                </div>
              )}

              {/* Conjugation for verbs */}
              {currentWord.conjugation && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 rounded-lg p-3 mb-2">
                  <div className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1.5 font-semibold">
                    Conjugation (Present)
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <div><span className="text-muted-foreground">ich</span> <span className="font-medium">{currentWord.conjugation.ich}</span></div>
                    <div><span className="text-muted-foreground">wir</span> <span className="font-medium">{currentWord.conjugation.wir}</span></div>
                    <div><span className="text-muted-foreground">du</span> <span className="font-medium">{currentWord.conjugation.du}</span></div>
                    <div><span className="text-muted-foreground">ihr</span> <span className="font-medium">{currentWord.conjugation.ihr}</span></div>
                    <div><span className="text-muted-foreground">er</span> <span className="font-medium">{currentWord.conjugation.er}</span></div>
                    <div><span className="text-muted-foreground">sie</span> <span className="font-medium">{currentWord.conjugation.sie}</span></div>
                  </div>
                  {currentWord.pastParticiple && (
                    <div className="mt-2 pt-2 border-t border-amber-200/50 dark:border-amber-800/40 text-xs">
                      <span className="text-muted-foreground">Past: </span>
                      <span className="font-medium">{currentWord.pastParticiple}</span>
                      {currentWord.praeteritum && (
                        <span className="text-muted-foreground ml-2">| Präteritum: <span className="font-medium">{currentWord.praeteritum}</span></span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Synonyms / Antonyms */}
              {(currentWord.synonyms?.length || currentWord.antonyms?.length) && (
                <div className="flex flex-wrap gap-2 mb-2 text-xs">
                  {currentWord.synonyms?.length ? (
                    <div>
                      <span className="text-muted-foreground">Syn: </span>
                      {currentWord.synonyms.map((s) => (
                        <span key={s} className="inline-block px-1.5 py-0.5 bg-accent/15 text-accent rounded mr-1">{s}</span>
                      ))}
                    </div>
                  ) : null}
                  {currentWord.antonyms?.length ? (
                    <div>
                      <span className="text-muted-foreground">Ant: </span>
                      {currentWord.antonyms.map((a) => (
                        <span key={a} className="inline-block px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 rounded mr-1">{a}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}

              {currentWord.mnemonic && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 rounded-lg p-2.5 text-left mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Memory Hook
                  </div>
                  <div className="text-xs text-foreground/80">{currentWord.mnemonic}</div>
                </div>
              )}
            </div>

            {/* SM-2 Quality rating buttons */}
            <div className="grid grid-cols-4 gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
              <Button
                onClick={() => handleResult(1)}
                variant="outline"
                size="sm"
                className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs py-1 h-auto"
              >
                Again
              </Button>
              <Button
                onClick={() => handleResult(3)}
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-xs py-1 h-auto"
              >
                Hard
              </Button>
              <Button
                onClick={() => handleResult(4)}
                size="sm"
                className="bg-primary/80 hover:bg-primary text-xs py-1 h-auto"
              >
                Good
              </Button>
              <Button
                onClick={() => handleResult(5)}
                size="sm"
                className="bg-accent hover:bg-accent/90 text-xs py-1 h-auto"
              >
                Easy
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Deep dive */}
      <div className="bg-secondary/40 border border-border/50 rounded-xl p-4">
        <button
          onClick={loadExplanation}
          disabled={loadingExplain}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-sm">AI Deep Dive</div>
              <div className="text-xs text-muted-foreground">
                {explanation ? "Tap to hide" : "Get more examples & memory tips"}
              </div>
            </div>
          </div>
          {loadingExplain && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </button>

        {explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 space-y-2 overflow-hidden"
          >
            {typeof explanation === "object" && explanation !== null && "mnemonic" in (explanation as Record<string, unknown>) && (
              <>
                <div className="text-xs">
                  <span className="font-semibold text-amber-700 dark:text-amber-400">Mnemonic: </span>
                  <span className="text-foreground/80">{(explanation as { mnemonic: string }).mnemonic}</span>
                </div>
                {Array.isArray((explanation as { examples?: unknown[] }).examples) && (
                  <div className="space-y-1.5">
                    {(explanation as { examples: { de: string; en: string }[] }).examples.map((ex, i) => (
                      <div key={i} className="text-xs bg-card rounded p-2 border border-border/40">
                        <div className="font-medium flex items-start gap-1">
                          <span>{ex.de}</span>
                          <button onClick={() => speak(ex.de)} className="text-primary flex-shrink-0">
                            <Volume2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-muted-foreground mt-0.5">{ex.en}</div>
                      </div>
                    ))}
                  </div>
                )}
                {(explanation as { tip?: string }).tip && (
                  <div className="text-xs">
                    <span className="font-semibold text-accent">Tip: </span>
                    <span className="text-foreground/80">{(explanation as { tip: string }).tip}</span>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFlipped(false);
            setExplanation(null);
            setCurrentIndex((i) => Math.max(0, i - 1));
          }}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFlipped(false);
            setExplanation(null);
            setCurrentIndex(0);
          }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restart
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFlipped(false);
            setExplanation(null);
            setCurrentIndex((i) => Math.min(prioritizedWords.length - 1, i + 1));
          }}
          disabled={currentIndex === prioritizedWords.length - 1}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
