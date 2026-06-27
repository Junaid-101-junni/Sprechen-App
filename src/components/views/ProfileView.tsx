"use client";

import { useAppStore } from "@/lib/store";
import { VOCAB_STATS } from "@/lib/german-data";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Zap,
  BookOpen,
  MessageCircle,
  Mic,
  ListChecks,
  Target,
  Award,
  RotateCcw,
  ChevronRight,
  Headphones,
  PenLine,
  Blocks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function ProfileView() {
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const sm2Cards = useAppStore((s) => s.sm2Cards);
  const quizzesPassed = useAppStore((s) => s.quizzesPassed);
  const chatMessages = useAppStore((s) => s.chatMessages);
  const pronunciationAttempts = useAppStore((s) => s.pronunciationAttempts);
  const dialoguesCompleted = useAppStore((s) => s.dialoguesCompleted);
  const listeningCompleted = useAppStore((s) => s.listeningCompleted);
  const writingSubmitted = useAppStore((s) => s.writingSubmitted);
  const sentencesBuilt = useAppStore((s) => s.sentencesBuilt);
  const achievements = useAppStore((s) => s.achievements);
  const resetProgress = useAppStore((s) => s.resetProgress);

  const allCards = Object.values(sm2Cards);
  const masteredWords = allCards.filter((c) => c.status === "mastered").length;
  const learningWords = allCards.filter((c) => c.status === "learning" || c.status === "review").length;
  const newWords = allCards.filter((c) => c.status === "new").length;
  const totalLearned = allCards.length;
  const unlockedAchievements = achievements.filter((a) => a.unlocked);

  const stats = [
    { label: "XP Earned", value: xp, icon: Zap, color: "text-amber-500" },
    { label: "Day Streak", value: streak, icon: Flame, color: "text-orange-500" },
    { label: "Words Learned", value: totalLearned, icon: BookOpen, color: "text-teal-500" },
    { label: "Mastered", value: masteredWords, icon: Target, color: "text-accent" },
    { label: "Quizzes Passed", value: quizzesPassed, icon: ListChecks, color: "text-violet-500" },
    { label: "AI Chats", value: chatMessages, icon: MessageCircle, color: "text-emerald-500" },
    { label: "Pronunciations", value: pronunciationAttempts, icon: Mic, color: "text-rose-500" },
    { label: "Dialogues Done", value: dialoguesCompleted, icon: Headphones, color: "text-cyan-500" },
    { label: "Listening Done", value: listeningCompleted, icon: Headphones, color: "text-indigo-500" },
    { label: "Writings Submitted", value: writingSubmitted, icon: PenLine, color: "text-pink-500" },
    { label: "Sentences Built", value: sentencesBuilt, icon: Blocks, color: "text-orange-500" },
    { label: "Achievements", value: unlockedAchievements.length, icon: Award, color: "text-amber-600" },
  ];

  const handleReset = () => {
    resetProgress();
    toast.success("Progress reset. Fresh start!");
  };

  // Level estimate based on XP
  const userLevel =
    xp < 200 ? "A1 Beginner" :
    xp < 600 ? "A2 Elementary" :
    xp < 1500 ? "B1 Intermediate" :
    "B2 Upper Intermediate";

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Profile header */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary to-accent rounded-2xl p-5 text-primary-foreground shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold border-2 border-white/30">
            🇩🇪
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wider opacity-90">German Learner</div>
            <div className="text-lg font-bold leading-tight">Deutsch Student</div>
            <div className="text-xs opacity-90 mt-0.5">Estimated: {userLevel}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur">
            <div className="text-xl font-bold tabular-nums">{xp}</div>
            <div className="text-[10px] opacity-90 uppercase">XP</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur">
            <div className="text-xl font-bold tabular-nums">{streak}</div>
            <div className="text-[10px] opacity-90 uppercase">Streak</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur">
            <div className="text-xl font-bold tabular-nums">{unlockedAchievements.length}</div>
            <div className="text-[10px] opacity-90 uppercase">Badges</div>
          </div>
        </div>
      </motion.section>

      {/* Stats grid */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
          Statistics
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border/60 rounded-xl p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-[10px] text-muted-foreground uppercase">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Word mastery breakdown */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
          Word Mastery
        </h2>
        <div className="bg-card border border-border/60 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Mastered ({masteredWords})</span>
            <span className="text-muted-foreground">Learning ({learningWords})</span>
            <span className="text-muted-foreground">New ({newWords})</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden bg-secondary flex">
            {masteredWords > 0 && (
              <div className="bg-accent" style={{ width: `${(masteredWords / Math.max(1, totalLearned)) * 100}%` }} />
            )}
            {learningWords > 0 && (
              <div className="bg-primary/60" style={{ width: `${(learningWords / Math.max(1, totalLearned)) * 100}%` }} />
            )}
            {newWords > 0 && (
              <div className="bg-secondary-foreground/30" style={{ width: `${(newWords / Math.max(1, totalLearned)) * 100}%` }} />
            )}
          </div>
          <div className="text-xs text-center text-muted-foreground">
            {totalLearned} of {VOCAB_STATS.total} words discovered
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
          Achievements ({unlockedAchievements.length}/{achievements.length})
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className={`relative rounded-xl p-3 border ${
                a.unlocked
                  ? "bg-gradient-to-br from-amber-50 to-card border-amber-300/60 dark:from-amber-950/30 dark:border-amber-700/40"
                  : "bg-secondary/40 border-border/50 opacity-70"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                a.unlocked
                  ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white"
                  : "bg-secondary text-muted-foreground"
              }`}>
                {a.unlocked ? <Trophy className="w-5 h-5" /> : <Award className="w-5 h-5" />}
              </div>
              <div className={`text-xs font-semibold ${a.unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                {a.title}
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                {a.description}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Reset section */}
      <section className="pt-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All Progress
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
              <AlertDialogDescription>
                This will erase all your XP, streak, learned words, quiz history, and achievements. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                className="bg-rose-500 hover:bg-rose-600 text-white"
              >
                Yes, reset everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>

      {/* About */}
      <section className="text-center pt-2 pb-4">
        <div className="text-xs text-muted-foreground">
          DeutschMeister AI · v1.0
        </div>
        <div className="text-[10px] text-muted-foreground/70 mt-1">
          Made for English speakers learning German · A1 → B2
        </div>
      </section>
    </div>
  );
}
