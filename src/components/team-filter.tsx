"use client";

interface TeamFilterProps {
  teams: string[];
  selectedTeam: string;
  onSelect: (team: string) => void;
}

export function TeamFilter({ teams, selectedTeam, onSelect }: TeamFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect("")}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          selectedTeam === ""
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        }`}
      >
        All Teams
      </button>
      {teams.map((team) => (
        <button
          key={team}
          onClick={() => onSelect(team)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selectedTeam === team
              ? "bg-green-600 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          {team}
        </button>
      ))}
    </div>
  );
}
