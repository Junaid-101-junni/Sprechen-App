"use client";

import { useSyncExternalStore, useState } from "react";
import { useAppStore, type ViewName } from "@/lib/store";
import { OnboardingView } from "@/components/views/OnboardingView";
import { HomeView } from "@/components/views/HomeView";
import { VocabView } from "@/components/views/VocabView";
import { VoiceChatView } from "@/components/views/VoiceChatView";
import { TranslateView } from "@/components/views/TranslateView";
import { SavedVocabView } from "@/components/views/SavedVocabView";
import { HistoryView } from "@/components/views/HistoryView";
import { RoleplayView } from "@/components/views/RoleplayView";
import { PronunciationView } from "@/components/views/PronunciationView";
import { GrammarView } from "@/components/views/GrammarView";
import { QuizView } from "@/components/views/QuizView";
import { ProfileView } from "@/components/views/ProfileView";
import { LessonsView } from "@/components/views/LessonsView";
import { ListeningView } from "@/components/views/ListeningView";
import { WritingView } from "@/components/views/WritingView";
import { SentenceView } from "@/components/views/SentenceView";
import { BottomNav } from "@/components/BottomNav";
import { TopBar } from "@/components/TopBar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import type { RoleplayScenario } from "@/lib/roleplay-data";

const emptySubscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export default function Home() {
  const currentView = useAppStore((s) => s.currentView);
  const setView = useAppStore((s) => s.setView);
  const currentLevel = useAppStore((s) => s.currentLevel);
  const onboarded = useAppStore((s) => s.profile?.onboarded);
  const mounted = useHydrated();
  const [activeRoleplay, setActiveRoleplay] = useState<RoleplayScenario | null>(null);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-400 to-amber-500 mx-auto mb-4 flex items-center justify-center">
            <span className="text-5xl font-extrabold text-gray-900">B</span>
          </div>
          <div className="text-2xl font-extrabold text-yellow-600 mb-1">Juni Boli Talk</div>
          <div className="text-muted-foreground text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  if (!onboarded) {
    return (
      <>
        <OnboardingView />
        <Toaster />
        <Sonner />
      </>
    );
  }

  const navToView: Record<string, ViewName> = {
    home: "home",
    translate: "translate",
    talk: "talk",
    vocab: "vocab",
  };
  const viewToNav: Record<ViewName, string> = {
    home: "home",
    translate: "translate",
    vocab: "vocab",
    chat: "talk",
    talk: "talk",
    "saved-vocab": "vocab",
    history: "vocab",
    roleplay: "talk",
    pronunciation: "home",
    grammar: "home",
    quiz: "home",
    profile: "home",
    lessons: "home",
    listening: "home",
    writing: "home",
    sentence: "home",
    more: "home",
    plan: "home",
  };

  const startRoleplay = (scenario: RoleplayScenario) => {
    setActiveRoleplay(scenario);
    setView("talk");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background max-w-md mx-auto md:max-w-lg lg:max-w-xl relative shadow-xl">
      <TopBar />
      <main className="flex-1 overflow-y-auto pb-24 pt-2 scrollbar-thin">
        {currentView === "home" && <HomeView />}
        {currentView === "translate" && <TranslateView />}
        {currentView === "saved-vocab" && <SavedVocabView />}
        {currentView === "history" && <HistoryView />}
        {currentView === "vocab" && <VocabView />}
        {currentView === "talk" && (
          activeRoleplay ? (
            <VoiceChatView
              key={activeRoleplay.id}
              initialScenario={activeRoleplay.scenario}
              initialPersona={activeRoleplay.persona}
              initialMessage={activeRoleplay.openingLine}
              scenarioTitle={activeRoleplay.title}
            />
          ) : (
            <VoiceChatView />
          )
        )}
        {currentView === "roleplay" && <RoleplayView onStartRoleplay={startRoleplay} />}
        {currentView === "pronunciation" && <PronunciationView key={currentLevel} />}
        {currentView === "grammar" && <GrammarView />}
        {currentView === "quiz" && <QuizView key={currentLevel} />}
        {currentView === "profile" && <ProfileView />}
        {currentView === "lessons" && <LessonsView />}
        {currentView === "listening" && <ListeningView />}
        {currentView === "writing" && <WritingView />}
        {currentView === "sentence" && <SentenceView key={currentLevel} />}
      </main>
      <BottomNav
        active={viewToNav[currentView]}
        onChange={(k) => {
          setView(navToView[k] || "home");
          if (k !== "talk") setActiveRoleplay(null);
        }}
      />
      <Toaster />
      <Sonner />
    </div>
  );
}
