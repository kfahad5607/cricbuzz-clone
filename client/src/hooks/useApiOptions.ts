import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import apiClient from "../services/api-client";
import { ApiOption } from "../types/common";

// types
export const queryKeys = {
  base: "options" as const,
  options: (resourceType: string, query: string, recordId?: number) => {
    if (recordId)
      return [queryKeys.base, resourceType, query, recordId] as const;
    else return [queryKeys.base, resourceType, query] as const;
  },
};

export const useApiOptions = (
  resourceType: string,
  query: string = "",
  recordId?: number
) => {
  let endpoint = `common/options/${resourceType}?query=${query}`;
  if (query) {
    recordId = undefined;
  }

  if (recordId) {
    endpoint += `&recordId=${recordId}`;
  }

  return useQuery<ApiOption[], Error, ApiOption[]>({
    queryKey: queryKeys.options(resourceType, query, recordId),
    queryFn: async () => {
      try {
        const response = await apiClient.get<ApiOption[]>(endpoint);

        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw {
            message: err.response?.data?.message || err.message,
          };
        }

        throw err;
      }
    },
    staleTime: 60 * 1000,
    retry: 1,
  });
};
