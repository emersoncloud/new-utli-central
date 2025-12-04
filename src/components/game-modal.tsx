"use client";

import { useEffect } from "react";
import type { Game, TeamRoster, Player } from "@/lib/types";

interface GameModalProps {
  game: Game;
  rosters: Record<string, TeamRoster>;
  onClose: () => void;
}

export function GameModal({ game, rosters, onClose }: GameModalProps) {
  const [homeTeam, awayTeam] = game.teams;
  const homeRoster = rosters[homeTeam.slug];
  const awayRoster = rosters[awayTeam.slug];

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl bg-white shadow-2xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {homeTeam.name} vs {awayTeam.name}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {game.date} · {game.time}
                {game.field && ` · ${game.field.name}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Rosters */}
        <div className="grid gap-6 p-6 md:grid-cols-2">
          <RosterPanel
            team={homeTeam}
            roster={homeRoster}
            isHome={true}
          />
          <RosterPanel
            team={awayTeam}
            roster={awayRoster}
            isHome={false}
          />
        </div>
      </div>
    </div>
  );
}

function RosterPanel({
  team,
  roster,
  isHome,
}: {
  team: Game["teams"][0];
  roster?: TeamRoster;
  isHome: boolean;
}) {
  const visiblePlayers = roster?.players.filter((p) => p.name !== "Hidden") || [];
  const hiddenCount = roster?.players.filter((p) => p.name === "Hidden").length || 0;

  // Group by gender
  const captains = visiblePlayers.filter((p) => p.role === "captain");
  const women = visiblePlayers.filter((p) => p.gender === "women" && p.role !== "captain");
  const men = visiblePlayers.filter((p) => p.gender === "men" && p.role !== "captain");
  const unknown = visiblePlayers.filter(
    (p) => p.gender === "unknown" && p.role !== "captain"
  );

  return (
    <div
      className={`rounded-lg border p-4 ${
        isHome
          ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
          : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50"
      }`}
    >
      <div className="mb-4 flex items-center gap-2">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {team.name}
        </h3>
        {isHome && (
          <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
            Home
          </span>
        )}
      </div>

      {!roster || roster.players.length === 0 ? (
        <p className="text-sm text-zinc-500">No roster available</p>
      ) : (
        <div className="space-y-4">
          {captains.length > 0 && (
            <PlayerSection title="Captains" players={captains} />
          )}
          {women.length > 0 && (
            <PlayerSection title="Women" players={women} />
          )}
          {men.length > 0 && <PlayerSection title="Men" players={men} />}
          {unknown.length > 0 && (
            <PlayerSection title="Players" players={unknown} />
          )}
          {hiddenCount > 0 && (
            <p className="text-sm text-zinc-400">
              + {hiddenCount} hidden player{hiddenCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PlayerSection({
  title,
  players,
}: {
  title: string;
  players: Player[];
}) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {title}
      </h4>
      <ul className="space-y-1">
        {players.map((player, i) => (
          <li
            key={player.profileUrl || i}
            className="flex items-center gap-2 text-sm"
          >
            {player.number && (
              <span className="w-6 text-right font-mono text-zinc-400">
                #{player.number}
              </span>
            )}
            <span className="text-zinc-900 dark:text-zinc-100">
              {player.name}
            </span>
            {player.role === "captain" && (
              <span className="text-xs text-yellow-600 dark:text-yellow-400">
                (C)
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
