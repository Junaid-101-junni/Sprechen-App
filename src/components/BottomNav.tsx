"use client";

import { Home, Languages, Mic, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface BottomNavProps {
  active: string;
  onChange: (key: string) => void;
}

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: Home },
  { key: "translate", label: "Translate", icon: Languages, primary: true },
  { key: "talk", label: "Talk", icon: Mic },
  { key: "vocab", label: "Vocab", icon: BookOpen },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg lg:max-w-xl z-40 bg-white/95 dark:bg-card/95 backdrop-blur-md border-t border-orange-100 dark:border-orange-950/30">
      <div className="grid grid-cols-4 px-2 py-1.5" style={{ paddingBottom: "calc(0.375rem + env(safe-area-inset-bottom))" }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          const isPrimary = item.primary;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className="relative flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-xl transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/20"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && !isPrimary && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {isPrimary ? (
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center -mt-3 transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/40 scale-110"
                    : "bg-gradient-to-br from-orange-400 to-amber-400 text-white shadow-md shadow-orange-500/20"
                }`}>
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
              ) : (
                <Icon
                  className={`relative w-5 h-5 transition-colors ${
                    isActive ? "text-orange-600 dark:text-orange-400" : "text-gray-400 dark:text-gray-500"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              )}
              <span
                className={`relative text-[10px] font-bold transition-colors ${
                  isActive ? "text-orange-600 dark:text-orange-400" : "text-gray-400 dark:text-gray-500"
                } ${isPrimary ? "mt-0" : ""}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
