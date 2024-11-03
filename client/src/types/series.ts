import { MatchFormat } from "./matches";

export type SeriesInfo = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  matches: {
    format: MatchFormat;
    count: number;
  }[];
};
