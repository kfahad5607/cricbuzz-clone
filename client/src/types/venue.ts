export type Venue = {
  id: number;
  name: string;
  city: string;
  country: string;
};

export type MatchVenue = Omit<Venue, "country">;
