"use client";

import { DIFFICULTIES, DIFFICULTY_ORDER } from "@/lib/minesweeper";
import { useBestTimes } from "@/hooks/useBestTimes";
import { MineIcon } from "@/components/ui/icons";
import { DifficultyCard } from "./DifficultyCard";
import { RulesGuide } from "./RulesGuide";

export function MainMenu() {
  const bestTimes = useBestTimes();
  return (
    <main className="flex flex-1 flex-col items-center gap-10 px-6 py-14">
      <header className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-3">
          <MineIcon size={34} className="text-accent" />
          <h1 className="text-4xl font-black tracking-[0.12em]">MINESWEEPER</h1>
        </div>
        <p className="text-sm text-ink-muted">Pick a field. Clear it. Beat your time.</p>
      </header>

      <section aria-label="Difficulty" className="flex flex-wrap justify-center gap-4">
        {DIFFICULTY_ORDER.map((key) => (
          <DifficultyCard key={key} difficulty={DIFFICULTIES[key]} bestMs={bestTimes[key]} />
        ))}
      </section>

      <RulesGuide />
    </main>
  );
}
