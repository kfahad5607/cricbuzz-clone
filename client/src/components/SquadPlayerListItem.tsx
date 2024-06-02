import { MdAirplanemodeActive } from "react-icons/md";
import { MatchSquadPlayer } from "../types/players";
import { PLAYER_ROLES_MAP } from "../utils/constants";

interface Props {
  player: MatchSquadPlayer;
  reversed?: boolean;
}

const SquadPlayerListItem = ({ player, reversed }: Props) => {
  let designation = "";
  if (player.isCaptain) designation = "(C)";
  else if (player.isKeeper) designation = "(WK)";

  if (player.isCaptain && player.isKeeper) designation = "(C & WK)";

  return (
    <div
      className={`p-2.5 flex items-center gap-x-2 first:border-t border-b border-gray-200 ${
        reversed ? "flex-row-reverse" : ""
      }`}
    >
      <div className="rounded-full overflow-hidden border-2 border-gray-400 ml-2 w-10 h-10">
        <img
          className="block w-full"
          src="https://static.cricbuzz.com/a/img/v1/40x40/i1/c182026/player_face.jpg"
          alt=""
        />
      </div>
      <div className={`flex-grow ${reversed ? "text-end" : ""}`}>
        <div className="text-base">
          {player.name} {designation}
        </div>
        <div className="text-xs mt-1">
          {PLAYER_ROLES_MAP[player.roleInfo.role]}
        </div>
      </div>
      {player.isForeignPlayer && (
        <div className="rotate-45 mr-1">
          <MdAirplanemodeActive className="text-slate-700" size="1.35em" />
        </div>
      )}
    </div>
  );
};

export default SquadPlayerListItem;
