import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";
import { SeriesInfoWithMatch } from "../types/series";

export const seriesInfoQueryKeys = {
  seriesInfo: (id: number) => ["seriesInfo", id] as const,
};

const useSeriesInfo = (seriesId: number) =>
  useQuery<SeriesInfoWithMatch, Error, SeriesInfoWithMatch>({
    queryKey: seriesInfoQueryKeys.seriesInfo(seriesId),
    queryFn: () =>
      apiClient
        .get<SeriesInfoWithMatch>(`series/${seriesId}/info`)
        .then((res) => res.data),
    retry: 1,
  });

export default useSeriesInfo;
