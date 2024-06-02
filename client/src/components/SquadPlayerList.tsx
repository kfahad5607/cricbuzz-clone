import { MatchSquadPlayer } from "../types/players";
import SquadPlayerListItem from "./SquadPlayerListItem";

interface TeamSquad {
  players: MatchSquadPlayer[];
}

interface Props {
  title: string;
  teams: TeamSquad[];
}

const SquadPlayerList = ({ title, teams }: Props) => {
  return (
    <div>
      <div className="text-center font-medium text-lg px-2 py-2">{title}</div>
      <div className="flex">
        <div className="w-1/2 border-r border-gray-300">
          {teams[0].players.map((player) => (
            <SquadPlayerListItem key={player.playerId} player={player} />
          ))}
        </div>
        <div className="w-1/2 border-l border-gray-300">
          {teams[1].players.map((player) => (
            <SquadPlayerListItem
              key={player.playerId}
              player={player}
              reversed
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SquadPlayerList;
