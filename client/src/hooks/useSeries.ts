import { keepPreviousData, useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";
import { Series, SeriesInfo } from "../types/series";
import myDayjs from "../services/dayjs";
import { PaginatedResponse } from "../types/common";

// types
type QueryKeyMatch = typeof seriesQueryKeys.all;

const queryKeys = {
  series: (query: string, page: number) => ["series", query, page] as const,
};

export type SeriesByMonth = {
  month: string;
  seriesType: SeriesInfo["seriesType"];
  series: SeriesInfo[];
};

export const seriesQueryKeys = {
  all: ["series"] as const,
};

const getSeriesByMonth = async () => {
  const response = await apiClient.get<SeriesInfo[]>("series/info/all");

  const seriesByMonth: SeriesByMonth[] = [];
  const indexMap: Record<string, number> = {};
  response.data.forEach((series) => {
    const startTime = myDayjs(series.startTime).utc().local();
    const month = startTime.format("MMMM YYYY");

    let index = indexMap[month];
    if (index === undefined) {
      index = seriesByMonth.length;
      indexMap[month] = index;

      seriesByMonth.push({
        month,
        seriesType: series.seriesType,
        series: [],
      });
    }
    seriesByMonth[index].series.push(series);
  });

  return seriesByMonth;
};

export const useSeries = () =>
  useQuery<SeriesByMonth[], Error, SeriesByMonth[], QueryKeyMatch>({
    queryKey: seriesQueryKeys.all,
    queryFn: getSeriesByMonth,
    retry: 1,
    staleTime: 15 * 60 * 1000,
  });

export const useSeriesPaginated = (query: string = "", page: number = 1) => {
  let endpoint = `series?page=${page}`;
  if (query) {
    endpoint += `&query=${query}`;
  }

  return useQuery<PaginatedResponse<Series>, Error, PaginatedResponse<Series>>({
    queryKey: queryKeys.series(query, page),
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<Series>>(endpoint)
        .then((res) => res.data),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
