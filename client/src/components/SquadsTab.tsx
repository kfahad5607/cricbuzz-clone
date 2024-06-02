import { useQuery } from "@tanstack/react-query";
import { ReactNode, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../services/api-client";
import { MatchSquad } from "../types/matches";
import { MatchSquadPlayer } from "../types/players";
import SquadPlayerList from "./SquadPlayerList";
import OverseasPlayerIcon from "./icons/OverseasPlayerIcon";
import { SwapIcon } from "./icons/SwapIcon";

const legendsList: {
  title: string;
  icon: ReactNode;
}[] = [
  {
    title: "Overseas player",
    icon: <OverseasPlayerIcon />,
  },
  {
    title: "Impact player",
    icon: <SwapIcon color="#0a9307" />,
  },
  {
    title: "Substituted player",
    icon: <SwapIcon />,
  },
];

const SquadsTab = () => {
  const { matchId } = useParams();
  const showLegendsRef = useRef(false);

  const { data, error, isLoading } = useQuery<MatchSquad>({
    queryKey: ["matchSquadsPlayers", matchId],
    queryFn: () =>
      apiClient.get(`matches/${matchId}/squads`).then((res) => res.data),
    retry: 1,
  });

  useEffect(() => {
    if (!data) return;
  }, [data]);

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
    let _showLegends = false;
    team.players.forEach((player) => {
      if (player.isPlaying) squadLists[0].teams[teamIdx].players.push(player);
      else if (player.isInSubs)
        squadLists[1].teams[teamIdx].players.push(player);
      else if (!player.isPlaying)
        squadLists[2].teams[teamIdx].players.push(player);

      _showLegends ||= !!(
        player.isSubstitute ||
        player.isSubstituted ||
        player.isForeignPlayer
      );
    });

    showLegendsRef.current = _showLegends;
  });

  return (
    <>
      <div className="bg-emerald-100 p-2.5 rounded-md flex justify-between">
        <div className="flex items-center gap-x-2">
          <div className="w-7 rounded overflow-hidden">
            <img
              className="block w-full"
              src="https://static.cricbuzz.com/a/img/v1/72x54/i1/c225641/team_flag.jpg"
              alt=""
            />
          </div>
          <div className="font-medium">CSK</div>
        </div>
        <div className="flex flex-row-reverse items-center gap-x-2">
          <div className="w-7 rounded overflow-hidden">
            <img
              className="block w-full"
              src="https://static.cricbuzz.com/a/img/v1/72x54/i1/c225643/team_flag.jpg"
              alt=""
            />
          </div>
          <div className="font-medium">RCB</div>
        </div>
      </div>
      <div className="mb-8">
        {squadLists.map((squadList, squadListIdx) => (
          <SquadPlayerList
            key={squadListIdx}
            title={squadList.title}
            teams={squadList.teams}
          />
        ))}
      </div>
      {showLegendsRef.current && (
        <div className="pl-5">
          {legendsList.map((legend) => (
            <div className="flex items-center gap-x-3 mb-3">
              {legend.icon}
              <div className="font-normal text-sm">{legend.title}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default SquadsTab;
