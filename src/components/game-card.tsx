import type { Game } from "@/lib/types";

interface GameCardProps {
  game: Game;
  highlightTeam?: string;
  onClick?: () => void;
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
      <div className="mb-2 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <span className="font-medium">{game.time}</span>
        {game.field && (
          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
            {game.field.name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <TeamName
          name={home.name}
          isHome={true}
          isHighlighted={home.name === highlightTeam}
        />
        <span className="text-zinc-400">vs</span>
        <TeamName
          name={away.name}
          isHome={false}
          isHighlighted={away.name === highlightTeam}
        />
      </div>
    </button>
  );
}

function TeamName({
  name,
  isHome,
  isHighlighted,
}: {
  name: string;
  isHome: boolean;
  isHighlighted: boolean;
}) {
  return (
    <span
      className={`flex items-center gap-1 ${
        isHighlighted ? "font-bold text-green-700 dark:text-green-400" : ""
      }`}
    >
      {name}
      {isHome && (
        <svg
          className="h-3 w-3 text-zinc-400"
          fill="currentColor"
          viewBox="0 0 576 512"
        >
          <path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" />
        </svg>
      )}
    </span>
  );
}
