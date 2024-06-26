import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";
import { CommentaryData } from "../types/commentary";

const useMatchCommentary = (matchId: number) =>
  useQuery<CommentaryData>({
    queryKey: ["matchCommentary", matchId],
    queryFn: () =>
      apiClient.get(`matches/${matchId}/commentary`).then((res) => res.data),
    retry: 1,
  });

export default useMatchCommentary;
