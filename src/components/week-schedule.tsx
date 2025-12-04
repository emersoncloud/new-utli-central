"use client";

import { useState } from "react";
import type {
  Game,
  WeekSchedule as WeekScheduleType,
  TeamRoster,
  Player,
} from "@/lib/types";
import { GameCard } from "./game-card";

interface WeekScheduleProps {
  week: WeekScheduleType;
  rosters: Record<string, TeamRoster>;
  highlightTeam?: string;
  isCurrentWeek?: boolean;
  onGameClick?: (game: Game) => void;
}

function parseTime(time: string): number {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const isPM = match[3].toUpperCase() === "PM";
  if (isPM && hours !== 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function WeekSchedule({
  week,
  rosters,
  highlightTeam,
  isCurrentWeek,
  onGameClick,
}: WeekScheduleProps) {
  const [expanded, setExpanded] = useState(false);

  const filteredGames = highlightTeam
    ? week.games.filter((g) => g.teams.some((t) => t.name === highlightTeam))
    : week.games;

  if (filteredGames.length === 0) return null;

  // Group games by time slot
  const gamesByTime = new Map<string, typeof filteredGames>();
  for (const game of filteredGames) {
    const existing = gamesByTime.get(game.time) || [];
    existing.push(game);
    gamesByTime.set(game.time, existing);
  }

  // Get the game date from first game
  const gameDate = filteredGames[0]?.date || "";

  return (
    <section
      className={`rounded-xl border p-6 ${
        isCurrentWeek
          ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
          : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50"
      }`}
    >
      <header className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {gameDate}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              expanded
                ? "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            {expanded ? "Hide Rosters" : "Show Rosters"}
          </button>
          {isCurrentWeek && (
            <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white">
              This Week
            </span>
          )}
        </div>
      </header>

      <div className="space-y-4">
        {Array.from(gamesByTime.entries())
          .sort(([a], [b]) => parseTime(a) - parseTime(b))
          .map(([time, games]) => (
            <div key={time}>
              <h3 className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {time}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {games.map((game) => (
                  <div key={game.id}>
                    <GameCard
                      game={game}
                      highlightTeam={highlightTeam}
                      onClick={onGameClick ? () => onGameClick(game) : undefined}
                    />
                    {expanded && (
                      <ExpandedRosters game={game} rosters={rosters} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}

function ExpandedRosters({
  game,
  rosters,
}: {
  game: Game;
  rosters: Record<string, TeamRoster>;
}) {
  const [homeTeam, awayTeam] = game.teams;
  const homeRoster = rosters[homeTeam.slug];
  const awayRoster = rosters[awayTeam.slug];

  return (
    <div className="mt-2 grid gap-2 rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 sm:grid-cols-2">
      <RosterList team={homeTeam.name} roster={homeRoster} isHome />
      <RosterList team={awayTeam.name} roster={awayRoster} />
    </div>
  );
}

function RosterList({
  team,
  roster,
  isHome,
}: {
  team: string;
  roster?: TeamRoster;
  isHome?: boolean;
}) {
  const visiblePlayers = roster?.players.filter((p) => p.name !== "Hidden") || [];

  // Same ordering as modal: Captains → Women → Men → Unknown
  const captains = visiblePlayers.filter((p) => p.role === "captain");
  const women = visiblePlayers.filter((p) => p.gender === "women" && p.role !== "captain");
  const men = visiblePlayers.filter((p) => p.gender === "men" && p.role !== "captain");
  const unknown = visiblePlayers.filter((p) => p.gender === "unknown" && p.role !== "captain");
  const orderedPlayers = [...captains, ...women, ...men, ...unknown];

  return (
    <div>
      <div className="mb-1 flex items-center gap-1 font-medium text-zinc-900 dark:text-zinc-100">
        {team}
        {isHome && (
          <span className="text-xs text-green-600 dark:text-green-400">
            (Home)
          </span>
        )}
      </div>
      {orderedPlayers.length === 0 ? (
        <span className="text-zinc-400">No roster</span>
      ) : (
        <ul className="text-zinc-600 dark:text-zinc-400">
          {orderedPlayers.map((p, i) => (
            <li key={p.profileUrl || i}>
              {p.name}
              {p.role === "captain" && (
                <span className="text-yellow-600 dark:text-yellow-400">
                  {" "}
                  (C)
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
