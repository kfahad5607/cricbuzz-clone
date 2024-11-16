export type Team = {
  id: number;
  name: string;
  shortName: string;
};

export type MatchVenue = Omit<Team, "country">;
