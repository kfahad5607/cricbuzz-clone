export interface MatchCard {
  id: number;
  slug: number;
  description: string;
  matchFormat: string;
  startTime: string;
  status: string;
  series: {
    title: string;
  };
  homeTeam: {
    name: string;
    shortName: string;
  };
  awayTeam: {
    name: string;
    shortName: string;
  };
}
