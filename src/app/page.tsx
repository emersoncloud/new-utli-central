import { ScheduleView } from "@/components/schedule-view";
import scheduleData from "@/data/schedule.json";
import type { ScheduleData } from "@/lib/types";

export default function Home() {
  const data = scheduleData as ScheduleData;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {data.leagueName}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Schedule &middot; Updated{" "}
            {new Date(data.lastUpdated).toLocaleDateString()}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <ScheduleView data={data} />
      </main>

      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-4 py-4 text-center text-sm text-zinc-500">
          <a
            href={data.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            View on Ultimate Central →
          </a>
        </div>
      </footer>
    </div>
  );
}
