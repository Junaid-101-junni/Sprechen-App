"use client";

import { useAppStore } from "@/lib/store";
import { Flame, Sparkles, Bookmark, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export function TopBar() {
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const savedVocabCount = useAppStore((s) => s.savedVocab.length);
  const setView = useAppStore((s) => s.setView);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="px-4 py-3 flex items-center justify-between">
        <button onClick={() => setView("home")} className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <span className="text-gray-900 font-extrabold text-lg">B</span>
          </div>
          <div className="text-left">
            <div className="font-extrabold text-base leading-tight text-yellow-600 dark:text-yellow-400">Juni Boli Talk</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">Speak German. Learn faster.</div>
          </div>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-full bg-secondary/80 border border-border/50 hover:bg-secondary transition-colors"
              title="Toggle dark mode"
            >
              {theme === "dark" ? (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          )}

          <button
            onClick={() => setView("saved-vocab")}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-full bg-secondary/80 border border-border/50 transition-all hover:bg-secondary ${
              savedVocabCount > 0 ? "text-accent" : "text-muted-foreground"
            }`}
            title={`${savedVocabCount} saved words`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${savedVocabCount > 0 ? "fill-accent" : ""}`} />
            {savedVocabCount > 0 && <span className="text-xs font-semibold tabular-nums">{savedVocabCount}</span>}
          </button>

          <div
            className={`flex items-center gap-1 px-2 py-1.5 rounded-full bg-secondary/80 border border-border/50 transition-all ${
              streak > 0 ? "glow-amber" : ""
            }`}
            title={`${streak} day streak`}
          >
            <Flame className={`w-3.5 h-3.5 ${streak > 0 ? "text-primary fill-primary" : "text-muted-foreground"}`} />
            <span className="text-xs font-semibold tabular-nums">{streak}</span>
          </div>

          <motion.div
            key={`xp-${xp}`}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-secondary/80 border border-border/50"
            title={`${xp} XP earned`}
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-semibold tabular-nums">{xp}</span>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
