export interface Player {
  name: string;
  number: string | null;
  role: "captain" | "player";
  gender: "men" | "women" | "unknown";
  profileUrl: string | null;
}

export interface TeamRoster {
  teamName: string;
  teamSlug: string;
  players: Player[];
}

export interface Team {
  name: string;
  url: string;
  slug: string;
  isHome: boolean;
}

export interface Field {
  name: string;
  url: string;
}

export interface Game {
  id: string;
  dateTime: string;
  date: string;
  time: string;
  teams: Team[];
  field: Field | null;
}

export interface WeekSchedule {
  weekStart: string;
  weekLabel: string;
  games: Game[];
}

export interface ScheduleData {
  lastUpdated: string;
  leagueName: string;
  sourceUrl: string;
  teams: string[];
  rosters: Record<string, TeamRoster>;
  weeks: WeekSchedule[];
}
