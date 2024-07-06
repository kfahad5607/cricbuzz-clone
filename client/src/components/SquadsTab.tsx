import { ReactNode, useRef } from "react";
import { useParams } from "react-router-dom";
import useMatchInfo from "../hooks/useMatchInfo";
import type { MatchSquadPlayer } from "../types/players";
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
  const params = useParams();
  const matchId = parseInt(params.matchId!);
  const showLegendsRef = useRef(false);

  const { data, error, isLoading } = useMatchInfo(matchId);

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
          players: data.homeTeam.players.playingXi,
        },
        {
          players: data.awayTeam.players.playingXi,
        },
      ],
    },
    {
      title: "Substitutes",
      teams: [
        {
          players: data.homeTeam.players.substitutes,
        },
        {
          players: data.awayTeam.players.substitutes,
        },
      ],
    },
    {
      title: "Bench",
      teams: [
        {
          players: data.homeTeam.players.bench,
        },
        {
          players: data.awayTeam.players.bench,
        },
      ],
    },
  ];

  showLegendsRef.current = Boolean(
    data.homeTeam.players.substitutes.length +
      data.awayTeam.players.substitutes.length
  );

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
          {legendsList.map((legend, legendIdx) => (
            <div key={legendIdx} className="flex items-center gap-x-3 mb-3">
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
