import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";
import { SeriesInfo } from "../types/series";
import myDayjs from "../services/dayjs";

// types
type QueryKeyMatch = typeof seriesQueryKeys.all;
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

const useSeries = () =>
  useQuery<SeriesByMonth[], Error, SeriesByMonth[], QueryKeyMatch>({
    queryKey: seriesQueryKeys.all,
    queryFn: getSeriesByMonth,
    retry: 1,
    staleTime: 15 * 60 * 1000,
  });

export default useSeries;
