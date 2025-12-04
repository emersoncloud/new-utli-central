"use client";

import { useState } from "react";

interface TeamFilterProps {
  teams: string[];
  selectedTeam: string;
  onSelect: (team: string) => void;
}

export function TeamFilter({ teams, selectedTeam, onSelect }: TeamFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile: Dropdown */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 text-left dark:border-zinc-700 dark:bg-zinc-800"
        >
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {selectedTeam || "All Teams"}
          </span>
          <svg
            className={`h-5 w-5 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="mt-2 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800">
            <button
              onClick={() => { onSelect(""); setIsOpen(false); }}
              className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                selectedTeam === ""
                  ? "bg-zinc-100 font-medium dark:bg-zinc-700"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-700"
              }`}
            >
              All Teams
            </button>
            {teams.map((team) => (
              <button
                key={team}
                onClick={() => { onSelect(team); setIsOpen(false); }}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                  selectedTeam === team
                    ? "bg-green-100 font-medium text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-700"
                }`}
              >
                {team}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Buttons */}
      <div className="hidden flex-wrap gap-2 sm:flex">
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
    </>
  );
}
