"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import type { CEFRLevel } from "@/lib/german-data";
import { TUTOR_PERSONAS } from "@/lib/tutor-personas";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const GOAL_OPTIONS = [
  { id: "travel", label: "Travel", emoji: "✈️", color: "from-blue-400 to-cyan-500" },
  { id: "work", label: "Work", emoji: "💼", color: "from-orange-400 to-amber-500" },
  { id: "study", label: "Study", emoji: "🎓", color: "from-purple-400 to-pink-500" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧", color: "from-rose-400 to-red-500" },
  { id: "culture", label: "Culture", emoji: "🎭", color: "from-amber-400 to-yellow-500" },
  { id: "daily", label: "Daily Life", emoji: "🏠", color: "from-teal-400 to-green-500" },
];

const SITUATION_OPTIONS = [
  { id: "greetings", label: "Greetings", emoji: "👋", color: "from-amber-400 to-orange-500" },
  { id: "cafe", label: "Café", emoji: "☕", color: "from-amber-500 to-yellow-600" },
  { id: "restaurant", label: "Restaurants", emoji: "🍽️", color: "from-orange-400 to-red-500" },
  { id: "shopping", label: "Shopping", emoji: "🛍️", color: "from-pink-400 to-rose-500" },
  { id: "directions", label: "Directions", emoji: "🗺️", color: "from-teal-400 to-cyan-500" },
  { id: "hotel", label: "Hotels", emoji: "🏨", color: "from-indigo-400 to-purple-500" },
  { id: "doctor", label: "Doctor", emoji: "🩺", color: "from-red-400 to-rose-500" },
  { id: "transport", label: "Transport", emoji: "🚆", color: "from-blue-400 to-indigo-500" },
  { id: "interview", label: "Interviews", emoji: "💼", color: "from-gray-400 to-slate-500" },
  { id: "smalltalk", label: "Small Talk", emoji: "💬", color: "from-green-400 to-teal-500" },
];

const LEVELS = [
  { code: "A1" as CEFRLevel, title: "Beginner", desc: "I'm just starting out", emoji: "🌱" },
  { code: "A2" as CEFRLevel, title: "Elementary", desc: "I know some basics", emoji: "🌿" },
  { code: "B1" as CEFRLevel, title: "Intermediate", desc: "I can have simple conversations", emoji: "🌳" },
  { code: "B2" as CEFRLevel, title: "Advanced", desc: "I'm comfortable speaking", emoji: "🎯" },
];

export function OnboardingView() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<CEFRLevel>("A1");
  const [goals, setGoals] = useState<string[]>([]);
  const [situations, setSituations] = useState<string[]>([]);
  const [tutorPersonaId, setTutorPersonaId] = useState("anna");
  const totalSteps = 6;

  const toggle = (arr: string[], setArr: (v: string[]) => void, id: string) => {
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  };

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return !!level;
    if (step === 3) return goals.length > 0;
    if (step === 4) return situations.length > 0;
    if (step === 5) return !!tutorPersonaId;
    return true;
  };

  const next = () => {
    if (step < totalSteps - 1) setStep((s) => s + 1);
    else completeOnboarding({ name: name.trim(), level, goals, situations, tutorPersonaId });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-background dark:to-amber-950/20 px-6 py-8">
      {/* Progress bar */}
      <div className="flex items-center gap-1.5 mb-8 max-w-md mx-auto w-full">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-gradient-to-r from-orange-500 to-amber-500" : "bg-orange-100 dark:bg-orange-950/30"}`} />
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-yellow-500/30">
                <span className="text-6xl font-extrabold text-gray-900">B</span>
              </div>
              <h1 className="text-4xl font-extrabold mb-3 text-yellow-600 dark:text-yellow-400">Hello.</h1>
              <p className="text-2xl font-bold text-foreground mb-1">Finally.</p>
              <p className="text-2xl font-bold text-foreground mb-5">Someone to speak with.</p>
              <p className="text-base text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Learn German by talking with <span className="font-semibold text-yellow-600 dark:text-yellow-400">Juni Boli Talk AI</span>. Real conversations, real-time corrections, real fluency.
              </p>
            </motion.div>
          )}

          {/* Step 1: Name */}
          {step === 1 && (
            <motion.div key="name" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h2 className="text-3xl font-extrabold mb-2 text-foreground">What's your name?</h2>
              <p className="text-base text-muted-foreground mb-8">Your AI tutor will use this to greet you.</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-5 py-4 text-xl font-medium rounded-2xl border-2 border-orange-200 bg-white dark:bg-card focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && canProceed() && next()}
              />
            </motion.div>
          )}

          {/* Step 2: Level */}
          {step === 2 && (
            <motion.div key="level" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h2 className="text-3xl font-extrabold mb-2 text-foreground">What's your level?</h2>
              <p className="text-base text-muted-foreground mb-8">Be honest — your tutor adapts to you.</p>
              <div className="space-y-3">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl.code}
                    onClick={() => setLevel(lvl.code)}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                      level === lvl.code
                        ? "border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 shadow-lg shadow-orange-500/10"
                        : "border-orange-100 dark:border-orange-950/30 hover:border-orange-300"
                    }`}
                  >
                    <div className="text-4xl">{lvl.emoji}</div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-foreground">{lvl.code} · {lvl.title}</div>
                      <div className="text-sm text-muted-foreground">{lvl.desc}</div>
                    </div>
                    {level === lvl.code && (
                      <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Goals — Circular selection */}
          {step === 3 && (
            <motion.div key="goals" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h2 className="text-3xl font-extrabold mb-2 text-foreground">Why are you learning German?</h2>
              <p className="text-base text-muted-foreground mb-8">Pick all that apply.</p>
              <div className="grid grid-cols-3 gap-4">
                {GOAL_OPTIONS.map((g) => {
                  const sel = goals.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      onClick={() => toggle(goals, setGoals, g.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                        sel
                          ? "border-orange-500 bg-gradient-to-b from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 shadow-lg shadow-orange-500/10"
                          : "border-orange-100 dark:border-orange-950/30 hover:border-orange-300"
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${g.color} flex items-center justify-center text-3xl shadow-md ${sel ? "scale-110" : "scale-100"} transition-transform`}>
                        {g.emoji}
                      </div>
                      <span className={`text-sm font-bold ${sel ? "text-orange-600" : "text-foreground"}`}>{g.label}</span>
                      {sel && (
                        <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center -mt-1">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 4: Situations — Circular selection */}
          {step === 4 && (
            <motion.div key="situations" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h2 className="text-3xl font-extrabold mb-2 text-foreground">What situations matter to you?</h2>
              <p className="text-base text-muted-foreground mb-8">We'll prioritize these in your lessons.</p>
              <div className="grid grid-cols-3 gap-3 max-h-[420px] overflow-y-auto scrollbar-thin pb-2">
                {SITUATION_OPTIONS.map((s) => {
                  const sel = situations.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggle(situations, setSituations, s.id)}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border-2 transition-all ${
                        sel
                          ? "border-orange-500 bg-gradient-to-b from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 shadow-md"
                          : "border-orange-100 dark:border-orange-950/30 hover:border-orange-300"
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl shadow-md ${sel ? "scale-110" : "scale-100"} transition-transform`}>
                        {s.emoji}
                      </div>
                      <span className={`text-xs font-bold text-center ${sel ? "text-orange-600" : "text-foreground"}`}>{s.label}</span>
                      {sel && (
                        <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center -mt-1">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 5: Tutor */}
          {step === 5 && (
            <motion.div key="tutor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h2 className="text-3xl font-extrabold mb-2 text-foreground">Pick your AI tutor</h2>
              <p className="text-base text-muted-foreground mb-8">Choose who you want to practice with.</p>
              <div className="space-y-3">
                {TUTOR_PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setTutorPersonaId(p.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      tutorPersonaId === p.id
                        ? "border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 shadow-lg shadow-orange-500/10"
                        : "border-orange-100 dark:border-orange-950/30 hover:border-orange-300"
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${p.avatarColor} flex items-center justify-center text-3xl flex-shrink-0 shadow-md ${tutorPersonaId === p.id ? "scale-110" : ""} transition-transform`}>
                      {p.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-foreground">{p.name}</div>
                      <div className="text-sm text-muted-foreground">{p.personality}</div>
                    </div>
                    {tutorPersonaId === p.id && (
                      <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 max-w-md mx-auto w-full mt-8">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="p-3 rounded-full bg-white dark:bg-card border border-orange-200 dark:border-orange-950/30 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-orange-600" />
          </button>
        )}
        <button
          onClick={next}
          disabled={!canProceed()}
          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all disabled:opacity-40 disabled:shadow-none"
        >
          {step === 0 ? "Get Started" : step === totalSteps - 1 ? "Start Learning" : "Continue"}
          <ChevronRight className="w-5 h-5 ml-1 inline" />
        </button>
      </div>
    </div>
  );
}
