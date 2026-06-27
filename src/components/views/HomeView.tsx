"use client";

import { useAppStore, selectFluencyScore, selectGrammarAccuracy } from "@/lib/store";
import { LEVELS, getWordsByLevel, type CEFRLevel } from "@/lib/german-data";
import { getScenariosByLevel } from "@/lib/roleplay-data";
import { getPersonaById } from "@/lib/tutor-personas";
import { motion } from "framer-motion";
import {
  Languages, Mic, BookOpen, Headphones, PenLine, Blocks, GraduationCap,
  ListChecks, User, ArrowRight, Sparkles, Flame, Zap, Theater, MessageCircle,
  Play, AlertCircle, History, ChevronRight, Bookmark, Clock, TrendingUp, Target,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function HomeView() {
  const setView = useAppStore((s) => s.setView);
  const setLevel = useAppStore((s) => s.setLevel);
  const currentLevel = useAppStore((s) => s.currentLevel);
  const sm2Cards = useAppStore((s) => s.sm2Cards);
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const profile = useAppStore((s) => s.profile);
  const conversations = useAppStore((s) => s.conversations);
  const mistakes = useAppStore((s) => s.mistakes);
  const savedVocabCount = useAppStore((s) => s.savedVocab.length);
  const speakingSeconds = useAppStore((s) => s.speakingSeconds);
  const fluencyScore = useAppStore(selectFluencyScore);
  const grammarAccuracy = useAppStore(selectGrammarAccuracy);

  const persona = getPersonaById(profile?.tutorPersonaId || "anna");
  const speakMin = Math.floor(speakingSeconds / 60);

  const getLevelProgress = (level: CEFRLevel) => {
    const levelWords = getWordsByLevel(level);
    const levelWordIds = new Set(levelWords.map((w) => w.id));
    const learned = Object.keys(sm2Cards).filter((id) => levelWordIds.has(id)).length;
    return { learned, total: levelWords.length, percent: levelWords.length > 0 ? Math.round((learned / levelWords.length) * 100) : 0 };
  };

  const scenariosForLevel = getScenariosByLevel(currentLevel);
  const todaysScenario = scenariosForLevel[0];
  const lastConversation = conversations[0];
  const recentMistakes = mistakes.slice(-3);

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Guten Tag,</div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{profile?.name || "Friend"} 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-900/30">
            <Flame className="w-4 h-4 text-orange-500" /><span className="text-xs font-bold tabular-nums text-orange-700 dark:text-orange-300">{streak}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-900/30">
            <Zap className="w-4 h-4 text-amber-500" /><span className="text-xs font-bold tabular-nums text-amber-700 dark:text-amber-300">{xp}</span>
          </div>
        </div>
      </motion.div>

      {/* Fluency Stats — colorful cards */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }} className="grid grid-cols-3 gap-2">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/50 dark:border-orange-900/30 rounded-2xl p-3 text-center">
          <div className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 mb-1">Fluency</div>
          <div className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">{fluencyScore}</div>
          <div className="text-[9px] text-muted-foreground">/100</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl p-3 text-center">
          <div className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 mb-1">Grammar</div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{grammarAccuracy}%</div>
          <div className="text-[9px] text-muted-foreground">accuracy</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200/50 dark:border-yellow-900/30 rounded-2xl p-3 text-center">
          <div className="text-[10px] uppercase font-bold text-yellow-600 dark:text-yellow-400 mb-1">Speaking</div>
          <div className="text-2xl font-extrabold text-yellow-600 dark:text-yellow-400">{speakMin}</div>
          <div className="text-[9px] text-muted-foreground">minutes</div>
        </div>
      </motion.div>

      {/* Primary CTA */}
      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} onClick={() => setView("translate")} className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-5 text-white shadow-xl shadow-orange-500/30 text-left">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/15 rounded-full -translate-y-12 translate-x-12" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1"><Languages className="w-4 h-4" /><div className="text-xs uppercase tracking-wider opacity-90">Speak English → Get German</div></div>
          <h2 className="text-xl font-bold leading-tight mb-1">Translate & Learn Words</h2>
          <p className="text-xs opacity-90 mb-3">Say anything in English. Tap any German word to hear it or save it.</p>
          <div className="inline-flex items-center gap-2 bg-white text-primary font-semibold py-2 px-4 rounded-xl text-sm"><Mic className="w-4 h-4" /> Start Translating</div>
        </div>
      </motion.button>

      {/* My Plan - Daily Learning Path */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <Target className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">My Daily Plan</span>
        </div>
        <div className="bg-card border border-border/60 rounded-xl p-3 space-y-2">
          <PlanItem icon={Mic} label="Practice speaking" desc={`${persona.name} is ready`} color="text-emerald-600 bg-emerald-100 dark:bg-emerald-950/30" onClick={() => setView("talk")} />
          <PlanItem icon={Languages} label="Learn new words" desc="Translate & save vocabulary" color="text-primary bg-primary/10" onClick={() => setView("translate")} />
          <PlanItem icon={Theater} label="Try a roleplay" desc={todaysScenario?.title || "Pick a scenario"} color="text-rose-600 bg-rose-100 dark:bg-rose-950/30" onClick={() => setView("roleplay")} />
        </div>
      </motion.div>

      {/* Secondary CTAs */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onClick={() => setView("talk")} className="bg-card border border-border/60 rounded-xl p-4 text-left hover:border-primary/40 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-center mb-2.5"><Mic className="w-5 h-5" /></div>
          <div className="font-semibold text-sm">Talk with AI</div>
          <div className="text-xs text-muted-foreground">Voice conversation</div>
        </motion.button>
        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} onClick={() => setView("saved-vocab")} className="bg-card border border-border/60 rounded-xl p-4 text-left hover:border-primary/40 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 flex items-center justify-center mb-2.5"><Bookmark className="w-5 h-5" /></div>
          <div className="font-semibold text-sm">Saved Words</div>
          <div className="text-xs text-muted-foreground">{savedVocabCount} word{savedVocabCount !== 1 ? "s" : ""}</div>
        </motion.button>
      </div>

      {/* Continue where you left off */}
      {lastConversation && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center gap-1.5 mb-2 px-1"><History className="w-3.5 h-3.5 text-accent" /><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Continue where you left off</span></div>
          <button onClick={() => setView("history")} className="w-full bg-secondary/40 border border-border/50 rounded-xl p-4 text-left hover:bg-secondary/60 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center flex-shrink-0"><MessageCircle className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0"><div className="font-semibold text-sm">{lastConversation.title}</div><div className="text-xs text-muted-foreground">{lastConversation.messageCount} messages · {lastConversation.vocabCollected.length} words learned</div></div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>
        </motion.div>
      )}

      {/* Today's Lesson */}
      {todaysScenario && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-1.5 mb-2 px-1"><Sparkles className="w-3.5 h-3.5 text-primary" /><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today's Lesson</span></div>
          <button onClick={() => setView("roleplay")} className="w-full bg-card border border-border/60 rounded-xl p-4 text-left hover:border-primary/40 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="text-4xl flex-shrink-0">{todaysScenario.emoji}</div>
              <div className="flex-1 min-w-0"><div className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-0.5">{currentLevel} · Roleplay</div><div className="font-semibold text-sm">{todaysScenario.title}</div><div className="text-xs text-muted-foreground line-clamp-1">{todaysScenario.scenario}</div></div>
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0"><Play className="w-4 h-4 ml-0.5" /></div>
            </div>
          </button>
        </motion.div>
      )}

      {/* Mistakes to review */}
      {recentMistakes.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center gap-1.5 mb-2 px-1"><AlertCircle className="w-3.5 h-3.5 text-amber-500" /><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Review your mistakes ({mistakes.length})</span></div>
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 rounded-xl p-3 space-y-2">
            {recentMistakes.map((m) => (
              <div key={m.id} className="flex items-center gap-2 text-xs"><span className="line-through text-rose-600 flex-1 truncate">{m.original}</span><ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" /><span className="text-accent font-medium flex-1 truncate">{m.corrected}</span></div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Practice Grid */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wide">Practice</h2>
        <div className="grid grid-cols-4 gap-2">
          <PracticeButton label="Roleplay" icon={Theater} color="bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" onClick={() => setView("roleplay")} />
          <PracticeButton label="Vocab" icon={BookOpen} color="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" onClick={() => setView("vocab")} />
          <PracticeButton label="Listen" icon={Headphones} color="bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" onClick={() => setView("listening")} />
          <PracticeButton label="Write" icon={PenLine} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" onClick={() => setView("writing")} />
          <PracticeButton label="Sentences" icon={Blocks} color="bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300" onClick={() => setView("sentence")} />
          <PracticeButton label="Grammar" icon={GraduationCap} color="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300" onClick={() => setView("grammar")} />
          <PracticeButton label="Quiz" icon={ListChecks} color="bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300" onClick={() => setView("quiz")} />
          <PracticeButton label="Profile" icon={User} color="bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300" onClick={() => setView("profile")} />
        </div>
      </section>

      {/* Vocabulary overview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }} className="bg-card border border-border/60 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Vocabulary Library</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {LEVELS.map((level) => {
            const isActive = currentLevel === level.code;
            return (
              <button
                key={level.code}
                onClick={() => { setLevel(level.code); setView("vocab"); }}
                className={`text-center p-2 rounded-lg border transition-all ${isActive ? "border-primary bg-primary/5" : "border-border/40 hover:border-primary/30"}`}
              >
                <div className={`text-sm font-bold ${level.color === "emerald" ? "text-emerald-600" : level.color === "amber" ? "text-amber-600" : level.color === "rose" ? "text-rose-600" : "text-teal-600"}`}>{level.code}</div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Your Path */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Your Path</h2>
        </div>
        <div className="space-y-2">
          {LEVELS.map((level, i) => {
            const progress = getLevelProgress(level.code);
            const isActive = currentLevel === level.code;
            return (
              <motion.button key={level.code} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }} onClick={() => { setLevel(level.code); setView("vocab"); }} className={`w-full bg-card border rounded-xl p-3 text-left transition-all hover:shadow-sm ${isActive ? "border-primary ring-1 ring-primary/30" : "border-border/60 hover:border-primary/40"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${level.color === "emerald" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : level.color === "amber" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" : level.color === "rose" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" : "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300"}`}>{level.code}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between"><span className="font-semibold text-sm">{level.name}</span></div>
                    <Progress value={progress.percent} className="h-1 mt-1" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function PlanItem({ icon: Icon, label, desc, color, onClick }: { icon: typeof Mic; label: string; desc: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/60 transition-colors text-left">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}><Icon className="w-4 h-4" /></div>
      <div className="flex-1 min-w-0"><div className="text-sm font-medium">{label}</div><div className="text-[11px] text-muted-foreground">{desc}</div></div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}

function PracticeButton({ label, icon: Icon, color, onClick }: { label: string; icon: typeof Mic; color: string; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick} className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-secondary/60 transition-colors">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}><Icon className="w-5 h-5" /></div>
      <span className="text-[10px] font-medium">{label}</span>
    </motion.button>
  );
}
