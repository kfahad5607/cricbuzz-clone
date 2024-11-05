import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";
import { SeriesTeamsItem } from "../types/series";

export const seriesInfoQueryKeys = {
  seriesTeams: (id: number) => ["seriesTeams", id] as const,
};

const useSeriesTeams = <TData = SeriesTeamsItem[]>(seriesId: number) =>
  useQuery<SeriesTeamsItem[], Error, TData>({
    queryKey: seriesInfoQueryKeys.seriesTeams(seriesId),
    queryFn: () =>
      apiClient
        .get<SeriesTeamsItem[]>(`series/${seriesId}/teams`)
        .then((res) => res.data),
    retry: 1,
  });

export default useSeriesTeams;
