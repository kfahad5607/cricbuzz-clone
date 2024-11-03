import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";
import { SeriesInfo } from "../types/series";

export const seriesInfoQueryKeys = {
  seriesInfo: (id: number) => ["seriesInfo", id] as const,
};

const useSeriesInfo = <TData = SeriesInfo>(seriesId: number) =>
  useQuery<SeriesInfo, Error, TData>({
    queryKey: seriesInfoQueryKeys.seriesInfo(seriesId),
    queryFn: () =>
      apiClient
        .get<SeriesInfo>(`series/${seriesId}/info`)
        .then((res) => res.data),
    retry: 1,
  });

export default useSeriesInfo;
