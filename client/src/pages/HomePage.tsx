import MatchPreviewCard from "../components/MatchPreviewCard";
import { useCurrentMatches } from "../hooks/useMatches";

const HomePage = () => {
  const { data, isLoading, error } = useCurrentMatches();

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
