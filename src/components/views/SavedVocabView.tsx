"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useAppStore, type SavedWord } from "@/lib/store";
import { useTTS } from "@/lib/use-speech";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Volume2,
  Trash2,
  BookmarkX,
  Play,
  Square,
  ArrowUpDown,
  Languages,
  BookOpen,
  VolumeX,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { CEFRLevel } from "@/lib/german-data";

type LevelFilter = "all" | CEFRLevel;
type SortMode = "recent" | "az";

const LEVEL_OPTIONS: { value: LevelFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
];

const ARTICLE_COLORS: Record<string, string> = {
  der: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30",
  die: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30",
  das: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
};

function formatSavedAt(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function SavedVocabView() {
  const savedVocab = useAppStore((s) => s.savedVocab);
  const unsaveWord = useAppStore((s) => s.unsaveWord);
  const setView = useAppStore((s) => s.setView);

  const tts = useTTS({ lang: "de-DE", rate: 0.9 });

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [playingAll, setPlayingAll] = useState(false);
  const [currentPlayingIdx, setCurrentPlayingIdx] = useState<number | null>(null);
  const playQueueRef = useRef<SavedWord[]>([]);
  const playIdxRef = useRef(0);
  const cancelledRef = useRef(false);

  const filtered = useMemo(() => {
    let pool = [...savedVocab];
    if (levelFilter !== "all") {
      pool = pool.filter((w) => w.level === levelFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      pool = pool.filter(
        (w) =>
          w.german.toLowerCase().includes(q) ||
          w.english.toLowerCase().includes(q) ||
          (w.type || "").toLowerCase().includes(q)
      );
    }
    if (sortMode === "az") {
      pool.sort((a, b) => a.german.localeCompare(b.german, "de"));
    } else {
      pool.sort((a, b) => b.savedAt - a.savedAt);
    }
    return pool;
  }, [savedVocab, levelFilter, search, sortMode]);

  const stopPlaying = useCallback(() => {
    cancelledRef.current = true;
    setPlayingAll(false);
    setCurrentPlayingIdx(null);
    tts.cancel();
  }, [tts]);

  const playAll = useCallback(() => {
    if (filtered.length === 0) {
      toast.info("No words to play");
      return;
    }
    if (playingAll) {
      stopPlaying();
      return;
    }
    cancelledRef.current = false;
    playQueueRef.current = filtered;
    playIdxRef.current = 0;
    setPlayingAll(true);

    const playNext = () => {
      if (cancelledRef.current) return;
      const queue = playQueueRef.current;
      const idx = playIdxRef.current;
      if (idx >= queue.length) {
        setPlayingAll(false);
        setCurrentPlayingIdx(null);
        toast.success("Finished playing all words");
        return;
      }
      const word = queue[idx];
      setCurrentPlayingIdx(idx);
      // Speak the article + word for nouns, otherwise just the word
      const text = word.article ? `${word.article} ${word.german}` : word.german;
      tts.speak(text, () => {
        if (cancelledRef.current) return;
        // Brief pause, then speak example, then move to next
        if (word.example) {
          setTimeout(() => {
            if (cancelledRef.current) return;
            tts.speak(word.example!, () => {
              if (cancelledRef.current) return;
              playIdxRef.current = idx + 1;
              setTimeout(playNext, 250);
            });
          }, 300);
        } else {
          playIdxRef.current = idx + 1;
          setTimeout(playNext, 250);
        }
      });
    };

    playNext();
  }, [filtered, playingAll, tts, stopPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      tts.cancel();
    };
  }, [tts]);

  // Stop playback if the filtered list changes shape (so indices stay valid).
  // stopPlaying is stable (useCallback) and playingAll is read at call time.
  useEffect(() => {
    if (playingAll) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      stopPlaying();
    }
  }, [filtered.length, playingAll, stopPlaying]);

  const handleRemove = (word: SavedWord) => {
    unsaveWord(word.german);
    toast.success(`Removed "${word.german}"`);
  };

  const speakWord = (word: SavedWord) => {
    if (playingAll) {
      stopPlaying();
    }
    const text = word.article ? `${word.article} ${word.german}` : word.german;
    tts.speak(text);
  };

  // Empty state
  if (savedVocab.length === 0) {
    return (
      <div className="px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center max-w-sm mx-auto"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/40 flex items-center justify-center mb-4">
            <BookOpen className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold mb-1">No saved words yet</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Bookmark words from translations and conversations to build your personal vocabulary list. They'll appear here for quick practice.
          </p>
          <Button
            onClick={() => setView("translate")}
            className="rounded-xl bg-accent hover:bg-accent/90"
          >
            <Languages className="w-4 h-4 mr-1.5" />
            Go to Translator
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          My Vocabulary
        </div>
        <h2 className="text-xl font-bold">
          {savedVocab.length} {savedVocab.length === 1 ? "word" : "words"} saved
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Tap the speaker to hear pronunciation · Play All to study hands-free
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search words, meanings, types..."
          className="pl-9 rounded-xl"
        />
      </div>

      {/* Filters + sort */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1 flex-1">
            {LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLevelFilter(opt.value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  levelFilter === opt.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "match" : "matches"}
          </div>
          <Button
            onClick={() => setSortMode((m) => (m === "recent" ? "az" : "recent"))}
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
          >
            <ArrowUpDown className="w-3 h-3 mr-1" />
            {sortMode === "recent" ? "Recent" : "A → Z"}
          </Button>
        </div>
      </div>

      {/* Play All bar */}
      {filtered.length > 0 && (
        <Button
          onClick={playAll}
          variant={playingAll ? "destructive" : "default"}
          className="w-full rounded-xl"
        >
          {playingAll ? (
            <>
              <Square className="w-4 h-4 mr-1.5" />
              Stop Playing
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-1.5" />
              Play All ({filtered.length})
            </>
          )}
        </Button>
      )}

      {/* No results (with words saved) */}
      {filtered.length === 0 && savedVocab.length > 0 && (
        <div className="bg-card border border-border/60 rounded-2xl p-6 text-center">
          <BookmarkX className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium">No matches found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try a different search or filter.
          </p>
          <Button
            onClick={() => {
              setSearch("");
              setLevelFilter("all");
            }}
            variant="outline"
            size="sm"
            className="mt-3 rounded-lg"
          >
            Reset filters
          </Button>
        </div>
      )}

      {/* Word list */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {filtered.map((word, idx) => {
            const isPlaying = currentPlayingIdx === idx && playingAll;
            const articleColor = word.article
              ? ARTICLE_COLORS[word.article.toLowerCase()] || ""
              : "";
            return (
              <motion.div
                key={`${word.german}-${word.savedAt}`}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: isPlaying ? 1.02 : 1,
                }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className={`bg-card border rounded-xl p-3 transition-colors ${
                  isPlaying
                    ? "border-emerald-400 dark:border-emerald-600 shadow-md shadow-emerald-500/10"
                    : "border-border/60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => speakWord(word)}
                    disabled={!tts.supported}
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isPlaying
                        ? "bg-emerald-500 text-white"
                        : "bg-secondary hover:bg-accent hover:text-accent-foreground"
                    } disabled:opacity-50`}
                    title="Listen"
                  >
                    {tts.supported ? (
                      <Volume2 className={`w-4 h-4 ${isPlaying ? "animate-pulse" : ""}`} />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-1.5">
                      {word.article && (
                        <span
                          className={`text-xs font-bold px-1.5 py-0.5 rounded ${articleColor}`}
                        >
                          {word.article}
                        </span>
                      )}
                      <span className="font-semibold text-base leading-tight">
                        {word.german}
                      </span>
                      {word.type && (
                        <Badge variant="secondary" className="text-[9px] h-4 px-1">
                          {word.type}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[9px] h-4 px-1">
                        {word.level}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {word.english}
                    </div>
                    {word.example && (
                      <div className="mt-2 bg-secondary/40 rounded-lg p-2">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                          Example
                        </div>
                        <div className="text-xs">{word.example}</div>
                      </div>
                    )}
                    <div className="text-[10px] text-muted-foreground mt-1">
                      Saved {formatSavedAt(word.savedAt)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(word)}
                    className="flex-shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer summary */}
      {filtered.length > 0 && (
        <div className="text-center text-[11px] text-muted-foreground pt-2 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3 h-3" />
          <span>
            {filtered.length} of {savedVocab.length} words shown
          </span>
        </div>
      )}
    </div>
  );
}
