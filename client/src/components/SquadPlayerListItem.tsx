import { MatchSquadPlayer } from "../types/players";
import { PLAYER_ROLES_MAP } from "../utils/constants";
import OverseasPlayerIcon from "./icons/OverseasPlayerIcon";
import { SwapIcon } from "./icons/SwapIcon";

interface Props {
  player: MatchSquadPlayer;
  reversed?: boolean;
}

const SquadPlayerListItem = ({ player, reversed }: Props) => {
  let designation = "";
  if (player.isCaptain) designation = "(C)";
  else if (player.isKeeper) designation = "(WK)";

  if (player.isCaptain && player.isKeeper) designation = "(C & WK)";

  const swapIconClass =
    "absolute -bottom-2.5 " + (reversed ? "-right-2.5" : "-left-2.5");

  return (
    <div
      className={`p-2.5 flex items-center gap-x-2 first:border-t border-b border-gray-200 ${
        reversed ? "flex-row-reverse" : ""
      }`}
    >
      <div className="relative rounded-full border-2 border-gray-200 ml-2 w-10 h-10">
        <img
          className="block w-full rounded-full"
          src="https://static.cricbuzz.com/a/img/v1/40x40/i1/c182026/player_face.jpg"
          alt=""
        />
        {player.isSubstitute && (
          <SwapIcon className={swapIconClass} color="#0a9307" />
        )}
        {player.isSubstituted && <SwapIcon className={swapIconClass} />}
      </div>
      <div className={`flex-grow ${reversed ? "text-end" : ""}`}>
        <div className="text-base">
          {player.name} {designation}
        </div>
        <div className="text-xs mt-1 text-gray-600">
          {PLAYER_ROLES_MAP[player.roleInfo.role]}
        </div>
      </div>
      {player.isForeignPlayer && <OverseasPlayerIcon />}
    </div>
  );
};

export default SquadPlayerListItem;
