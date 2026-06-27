"use client";

import { useState, useMemo, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useTTS } from "@/lib/use-speech";
import { getScenariosByLevel, type RoleplayScenario } from "@/lib/roleplay-data";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Volume2,
  Play,
  Sparkles,
  Target,
  MessageSquareText,
  User,
  MapPin,
  Mic,
  Loader2,
  Bookmark,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { CEFRLevel } from "@/lib/german-data";

const LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2"];

const LEVEL_DESCRIPTIONS: Record<CEFRLevel, string> = {
  A1: "Beginner · Everyday basics",
  A2: "Elementary · Simple exchanges",
  B1: "Intermediate · Real conversations",
  B2: "Upper-Int · Nuanced discussion",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Social: "👥",
  "Daily Life": "☀️",
  Travel: "✈️",
  Health: "🩺",
  Shopping: "🛍️",
  Work: "💼",
  Politics: "🏛️",
  Technology: "💻",
};

interface RoleplayViewProps {
  onStartRoleplay: (scenario: RoleplayScenario) => void;
}

export function RoleplayView({ onStartRoleplay }: RoleplayViewProps) {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const setLevel = useAppStore((s) => s.setLevel);
  const tts = useTTS({ lang: "de-DE", rate: 0.92 });

  const [activeLevel, setActiveLevel] = useState<CEFRLevel>(currentLevel);
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario | null>(null);
  const [starting, setStarting] = useState(false);

  // Keep the local level selector in sync if global level changes elsewhere
  useEffect(() => {
    setActiveLevel(currentLevel);
  }, [currentLevel]);

  const scenarios = useMemo(() => getScenariosByLevel(activeLevel), [activeLevel]);

  const handleLevelChange = (lvl: CEFRLevel) => {
    setActiveLevel(lvl);
    setLevel(lvl);
  };

  const speak = (text: string) => {
    if (!tts.supported) {
      toast.error("Audio playback isn't supported in this browser.");
      return;
    }
    tts.speak(text);
  };

  const handleStart = (scenario: RoleplayScenario) => {
    setStarting(true);
    // Speak the opening line, then start the roleplay
    if (scenario.openingLine && tts.supported) {
      tts.speak(scenario.openingLine, () => {
        setStarting(false);
        onStartRoleplay(scenario);
      });
    } else {
      // Small delay so UI can show loading state
      setTimeout(() => {
        setStarting(false);
        onStartRoleplay(scenario);
      }, 400);
    }
  };

  // Detail view
  if (selectedScenario) {
    const s = selectedScenario;
    return (
      <div className="px-4 py-4 space-y-3">
        <button
          onClick={() => {
            if (starting) return;
            setSelectedScenario(null);
            tts.cancel();
          }}
          disabled={starting}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to scenarios
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-violet-50 via-card to-fuchsia-50 dark:from-violet-950/20 dark:via-card dark:to-fuchsia-950/20 border border-border/60 rounded-2xl p-5"
        >
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-2xl bg-card border border-border/60 flex items-center justify-center text-3xl flex-shrink-0">
              {s.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant="secondary" className="text-[9px] h-4 px-1">
                  {s.level}
                </Badge>
                <Badge variant="outline" className="text-[9px] h-4 px-1">
                  <Tag className="w-2.5 h-2.5 mr-0.5" />
                  {s.category}
                </Badge>
              </div>
              <h2 className="text-lg font-bold leading-tight">{s.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5 italic">{s.titleDe}</p>
            </div>
          </div>
        </motion.div>

        {/* Scenario description */}
        <div className="bg-card border border-border/60 rounded-2xl p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Scenario
          </div>
          <p className="text-sm leading-relaxed">{s.scenario}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2.5 pt-2.5 border-t border-border/40">
            <MapPin className="w-3 h-3" />
            <span>{s.setting}</span>
          </div>
        </div>

        {/* Persona */}
        <div className="bg-card border border-border/60 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            <User className="w-3 h-3" />
            You'll talk with
          </div>
          <div className="text-sm font-semibold">{s.persona}</div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {s.personaDescription}
          </p>
        </div>

        {/* Opening line */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Opening Line
            </div>
            <Button
              onClick={() => speak(s.openingLine)}
              variant="outline"
              size="sm"
              className="h-7 rounded-full text-xs"
            >
              <Volume2 className={`w-3.5 h-3.5 mr-1 ${tts.speaking ? "animate-pulse" : ""}`} />
              Listen
            </Button>
          </div>
          <p className="text-base font-semibold leading-snug">{s.openingLine}</p>
          <p className="text-xs text-muted-foreground mt-1">{s.openingLineEn}</p>
        </div>

        {/* Goals */}
        <div className="bg-card border border-border/60 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            <Target className="w-3 h-3" />
            Your Goals
          </div>
          <ul className="space-y-1.5">
            {s.goals.map((goal, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2 text-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>{goal}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Useful phrases */}
        <div className="bg-card border border-border/60 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            <MessageSquareText className="w-3 h-3" />
            Useful Phrases
          </div>
          <div className="space-y-2">
            {s.usefulPhrases.map((phrase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 bg-secondary/40 rounded-lg p-2"
              >
                <button
                  onClick={() => speak(phrase.de)}
                  className="flex-shrink-0 w-7 h-7 rounded-full bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"
                  title={`Hear "${phrase.de}"`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{phrase.de}</div>
                  <div className="text-xs text-muted-foreground">{phrase.en}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Start button */}
        <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-background/95 backdrop-blur-sm border-t border-border/40">
          <Button
            onClick={() => handleStart(s)}
            disabled={starting}
            className="w-full rounded-xl h-12 text-base bg-accent hover:bg-accent/90"
          >
            {starting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Start Voice Conversation
              </>
            )}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            {tts.supported
              ? "The opening line will play, then your mic will activate."
              : "Tap to begin · Audio not supported on this browser."}
          </p>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 text-xs font-medium mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Roleplay Studio
        </div>
        <h2 className="text-xl font-bold">Practice real conversations</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Pick a scenario · Hear native German · Jump into the dialogue
        </p>
      </div>

      {/* Level selector */}
      <div className="bg-card border border-border/60 rounded-2xl p-3">
        <div className="grid grid-cols-4 gap-1.5">
          {LEVELS.map((lvl) => {
            const count = getScenariosByLevel(lvl).length;
            const isActive = activeLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => handleLevelChange(lvl)}
                className={`relative px-2 py-2.5 rounded-xl text-center transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                }`}
              >
                <div className="text-sm font-bold">{lvl}</div>
                <div className={`text-[9px] ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {count} scenes
                </div>
              </button>
            );
          })}
        </div>
        <div className="text-[10px] text-muted-foreground text-center mt-2">
          {LEVEL_DESCRIPTIONS[activeLevel]}
        </div>
      </div>

      {/* Scenarios grid */}
      {scenarios.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-2xl p-6 text-center">
          <Bookmark className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium">No scenarios at this level yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try a different level to find available scenarios.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          <AnimatePresence mode="popLayout">
            {scenarios.map((s, idx) => (
              <motion.button
                key={s.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: Math.min(idx * 0.04, 0.3), duration: 0.18 }}
                onClick={() => {
                  setSelectedScenario(s);
                  // Preview the opening line softly after a moment
                  if (s.openingLine && tts.supported) {
                    setTimeout(() => tts.speak(s.openingLine), 350);
                  }
                }}
                className="group text-left bg-card border border-border/60 hover:border-border hover:shadow-md transition-all rounded-2xl p-3 flex flex-col"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center text-2xl">
                    {s.emoji}
                  </div>
                  <Badge variant="outline" className="text-[9px] h-4 px-1">
                    {s.level}
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold leading-tight mb-1 line-clamp-2">
                  {s.title}
                </h3>
                <div className="text-[10px] text-muted-foreground mb-1.5">
                  {CATEGORY_EMOJIS[s.category] || "💬"} {s.category}
                </div>
                <div className="mt-auto pt-1.5 border-t border-border/30 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <User className="w-2.5 h-2.5" />
                  <span className="truncate">{s.persona.split(",")[0]}</span>
                </div>
                <div className="mt-2 inline-flex items-center justify-center gap-1 text-[10px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-2.5 h-2.5" />
                  Open scenario
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Tips */}
      <div className="bg-secondary/40 border border-border/40 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold mb-0.5">How roleplay works</div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              The tutor stays in character, speaks German at your level, and gently corrects you. Don't worry about mistakes — that's how you learn!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
