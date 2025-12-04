import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import type {
  Game,
  Player,
  ScheduleData,
  TeamRoster,
  WeekSchedule,
} from "../src/lib/types";

const BASE_URL = "https://northeastohio.ultimatecentral.com";
const SCHEDULE_URL = `${BASE_URL}/e/neo-ult-winter-league-2025-2026/schedule`;

function extractSlug(url: string): string {
  const match = url.match(/\/t\/([^/]+)/);
  return match?.[1] || "";
}

async function scrapeRoster(teamSlug: string): Promise<TeamRoster> {
  const url = `${BASE_URL}/t/${teamSlug}/roster`;
  console.log(`  Fetching roster: ${teamSlug}`);

  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const teamName = $("h1").first().text().trim() || teamSlug;
  const players: Player[] = [];

  // Track current gender section
  let currentGender: "men" | "women" | "unknown" = "unknown";

  // Process elements in order to track section headers
  $("h2, .media-item-tile, .media-list-wrapper").each((_, el) => {
    const $el = $(el);

    // Check for section headers
    if ($el.is("h2")) {
      const text = $el.text().trim().toLowerCase();
      if (text === "women") currentGender = "women";
      else if (text === "men") currentGender = "men";
      else if (text === "captains") currentGender = "unknown";
      return;
    }

    // Check for player tiles
    const $tile = $el.hasClass("media-item-tile")
      ? $el
      : $el.find(".media-item-tile").first();

    if ($tile.length && $tile.attr("href")?.includes("/u/")) {
      const profileUrl = $tile.attr("href") || null;
      const name = $tile.find("h3").text().trim();

      if (name && name !== "Hidden by user") {
        // Get jersey number
        const numberText = $tile.find(".align-right").text().trim();
        const numberMatch = numberText.match(/#(\d+)/);

        // Check badges for captain
        const badges = $tile.find(".badge").text().toLowerCase();
        const isCaptain = badges.includes("captain");

        players.push({
          name,
          number: numberMatch ? numberMatch[1] : null,
          role: isCaptain ? "captain" : "player",
          gender: currentGender,
          profileUrl,
        });
      }
    }

    // Check for hidden players
    if ($el.text().includes("Hidden by user")) {
      players.push({
        name: "Hidden",
        number: null,
        role: "player",
        gender: currentGender,
        profileUrl: null,
      });
    }
  });

  // Deduplicate players by profileUrl or name
  const seen = new Set<string>();
  const uniquePlayers = players.filter((p) => {
    const key = p.profileUrl || p.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    teamName,
    teamSlug,
    players: uniquePlayers,
  };
}

async function scrapeSchedule(): Promise<ScheduleData> {
  console.log(`Fetching schedule from ${SCHEDULE_URL}...`);
  const response = await fetch(SCHEDULE_URL);
  const html = await response.text();
  const $ = cheerio.load(html);

  const games: Game[] = [];
  const teamSlugs = new Map<string, string>(); // name -> slug

  $(".game-list-item").each((_, el) => {
    const $game = $(el);
    const id = $game.attr("id")?.replace("game-list-item-", "") || "";

    const dateDiv = $game.find(".flex-basis-md-15");
    const rawDateTime = dateDiv.text().trim().replace(/\s+/g, " ");

    const dateMatch = rawDateTime.match(
      /(\w+,\s+\d+\s+\w+\s+\d+)\s+(\d+:\d+\s*(?:AM|PM))/i
    );
    const date = dateMatch?.[1] || rawDateTime;
    const time = dateMatch?.[2] || "";

    const teamLinks = $game.find('a[href*="/t/"]');
    const teams = teamLinks
      .map((_, teamEl) => {
        const $team = $(teamEl);
        const name = $team.text().trim();
        const url = $team.attr("href") || "";
        const slug = extractSlug(url);

        if (name && slug) {
          teamSlugs.set(name, slug);
        }

        return {
          name,
          url,
          slug,
          isHome: $team.html()?.includes("house") || false,
        };
      })
      .get();

    const fieldLink = $game.find('a[href*="/f/"]');
    const field = fieldLink.length
      ? {
          name: fieldLink.text().trim(),
          url: fieldLink.attr("href") || "",
        }
      : null;

    if (id && teams.length === 2) {
      games.push({
        id,
        dateTime: rawDateTime,
        date,
        time,
        teams,
        field,
      });
    }
  });

  // Fetch rosters for all teams
  console.log(`\nFetching rosters for ${teamSlugs.size} teams...`);
  const rosters: Record<string, TeamRoster> = {};

  for (const [name, slug] of teamSlugs) {
    try {
      rosters[slug] = await scrapeRoster(slug);
      // Small delay to be nice to the server
      await new Promise((r) => setTimeout(r, 200));
    } catch (error) {
      console.error(`  Failed to fetch roster for ${name}:`, error);
      rosters[slug] = { teamName: name, teamSlug: slug, players: [] };
    }
  }

  // Group games by week
  const weekMap = new Map<string, Game[]>();
  for (const game of games) {
    const gameDate = parseDate(game.date);
    const weekStart = getWeekStart(gameDate);
    const weekKey = weekStart.toISOString().split("T")[0];

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, []);
    }
    weekMap.get(weekKey)!.push(game);
  }

  const weeks: WeekSchedule[] = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, weekGames]) => ({
      weekStart,
      weekLabel: formatWeekLabel(new Date(weekStart)),
      games: weekGames.sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        return a.time.localeCompare(b.time);
      }),
    }));

  return {
    lastUpdated: new Date().toISOString(),
    leagueName: "NEO Ult Winter League 2025-2026",
    sourceUrl: SCHEDULE_URL,
    teams: Array.from(teamSlugs.keys()).sort(),
    rosters,
    weeks,
  };
}

function parseDate(dateStr: string): Date {
  const months: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  const match = dateStr.match(/(\d+)\s+(\w+)\s+(\d+)/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = months[match[2]] ?? 0;
    const year = parseInt(match[3], 10);
    return new Date(year, month, day);
  }
  return new Date();
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekLabel(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const start = date.toLocaleDateString("en-US", options);
  const end = new Date(date);
  end.setDate(end.getDate() + 6);
  const endStr = end.toLocaleDateString("en-US", options);
  return `${start} - ${endStr}`;
}

async function main() {
  try {
    const data = await scrapeSchedule();

    const outputPath = path.join(
      process.cwd(),
      "src",
      "data",
      "schedule.json"
    );
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log(`\n✓ Scraped ${data.weeks.length} weeks of games`);
    console.log(`✓ Found ${data.teams.length} teams`);
    console.log(`✓ Scraped ${Object.keys(data.rosters).length} rosters`);
    console.log(`✓ Saved to ${outputPath}`);
  } catch (error) {
    console.error("Failed to scrape schedule:", error);
    process.exit(1);
  }
}

main();
