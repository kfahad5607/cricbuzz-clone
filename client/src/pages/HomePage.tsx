import { useQuery } from "@tanstack/react-query";
import MatchPreviewCard from "../components/MatchPreviewCard";
import apiClient from "../services/api-client";
import { MatchCard } from "../types/matches";

const HomePage = () => {
  const { data, isLoading, error } = useQuery<MatchCard[]>({
    queryKey: ["currentMatches"],
    queryFn: () => apiClient.get("matches/current").then((res) => res.data),
  });

  if (isLoading) return <h3>Loading...</h3>;

  if (error) return <h3>{"Something went wrong " + error.message}</h3>;

  if (!data) return null;

  return (
    <div className=" ">
      <div className="flex gap-3 overflow-auto">
        {data.map((match) => (
          <MatchPreviewCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
