"use client";

import { useState } from "react";
import type { Game, ScheduleData, TeamRoster } from "@/lib/types";
import { TeamFilter } from "./team-filter";
import { WeekSchedule } from "./week-schedule";
import { GameModal } from "./game-modal";

interface ScheduleViewProps {
  data: ScheduleData;
}

export function ScheduleView({ data }: ScheduleViewProps) {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Determine current week
  const today = new Date();
  const currentWeekIndex = data.weeks.findIndex((week) => {
    const weekStart = new Date(week.weekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return today >= weekStart && today < weekEnd;
  });

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Filter by Team
        </h2>
        <TeamFilter
          teams={data.teams}
          selectedTeam={selectedTeam}
          onSelect={setSelectedTeam}
        />
      </section>

      <section className="space-y-6">
        {data.weeks.map((week, index) => (
          <WeekSchedule
            key={week.weekStart}
            week={week}
            rosters={data.rosters}
            highlightTeam={selectedTeam}
            isCurrentWeek={index === currentWeekIndex}
            onGameClick={setSelectedGame}
          />
        ))}
      </section>

      {selectedGame && (
        <GameModal
          game={selectedGame}
          rosters={data.rosters}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </div>
  );
}
