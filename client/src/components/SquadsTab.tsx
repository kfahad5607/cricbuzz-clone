import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";
import SquadPlayerList from "./SquadPlayerList";
import { MatchSquad } from "../types/matches";
import { MatchSquadPlayer } from "../types/players";

const SquadsTab = () => {
  const matchId = 1;
  const { data, error, isLoading } = useQuery<MatchSquad>({
    queryKey: ["matchSquadsPlayers", matchId],
    queryFn: () =>
      apiClient.get(`matches/${matchId}/squads`).then((res) => res.data),
  });

  if (isLoading)
    return <div className="text-center mx-2 my-3 text-xl">Loading...</div>;

  if (error) return <h3>{"Something went wrong " + error.message}</h3>;
  if (!data) return <h3>{"Unable to get squad list"}</h3>;

  const squadLists: {
    title: string;
    teams: {
      players: MatchSquadPlayer[];
    }[];
  }[] = [
    {
      title: "Playing XI",
      teams: [
        {
          players: [],
        },
        {
          players: [],
        },
      ],
    },
    {
      title: "Substitutes",
      teams: [
        {
          players: [],
        },
        {
          players: [],
        },
      ],
    },
    {
      title: "Bench",
      teams: [
        {
          players: [],
        },
        {
          players: [],
        },
      ],
    },
  ];

  data.teams.forEach((team, teamIdx) => {
    team.players.forEach((player) => {
      if (player.isPlaying) squadLists[0].teams[teamIdx].players.push(player);
      else if (player.isInSubs)
        squadLists[1].teams[teamIdx].players.push(player);
      else if (!player.isPlaying)
        squadLists[2].teams[teamIdx].players.push(player);
    });
  });

  console.log("squadList ", squadLists);

  return (
    <>
      {squadLists.map((squadList, squadListIdx) => (
        <SquadPlayerList
          key={squadListIdx}
          title={squadList.title}
          teams={squadList.teams}
        />
      ))}
    </>
  );
};

export default SquadsTab;
