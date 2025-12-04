import type { Game } from "@/lib/types";

interface GameCardProps {
  game: Game;
  highlightTeam?: string;
  onClick?: () => void;
}

function simplifyFieldName(name: string): string {
  return name.replace(/^NC Soccer\s*/i, "");
}

export function GameCard({ game, highlightTeam, onClick }: GameCardProps) {
  const [home, away] = game.teams;
  const isHighlighted = highlightTeam
    ? game.teams.some((t) => t.name === highlightTeam)
    : false;

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border p-4 text-left transition-all ${
        isHighlighted
          ? "border-green-500 bg-green-50 dark:bg-green-950/30"
          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      } ${onClick ? "cursor-pointer hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={
              home.name === highlightTeam
                ? "font-bold text-green-700 dark:text-green-400"
                : ""
            }
          >
            {home.name}
          </span>
          <span className="text-zinc-400">vs</span>
          <span
            className={
              away.name === highlightTeam
                ? "font-bold text-green-700 dark:text-green-400"
                : ""
            }
          >
            {away.name}
          </span>
        </div>
        {game.field && (
          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
            {simplifyFieldName(game.field.name)}
          </span>
        )}
      </div>
    </button>
  );
}
