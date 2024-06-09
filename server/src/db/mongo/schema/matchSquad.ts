import { Schema, model } from "mongoose";
import { DBIdType, DBIdUniqueType } from "../schemaTypes";
import { MatchSquad, MatchSquadPlayer } from "../../../types";

const squadPlayerSchema = new Schema(
  {
    playerId: DBIdType,
    isPlaying: Boolean,
    isInSubs: Boolean,
    isIncluded: Boolean,
    isExcluded: Boolean,
    isSubstitute: Boolean,
    isSubstituted: Boolean,
    isCaptain: Boolean,
    isKeeper: Boolean,
    isForeignPlayer: Boolean,
  },
  { _id: false }
);

const matchSquadsSchema = new Schema<MatchSquad<MatchSquadPlayer>>({
  matchId: DBIdUniqueType,
  teams: [
    new Schema(
      {
        teamId: DBIdType,
        players: [squadPlayerSchema],
      },
      { _id: false }
    ),
  ],
});

const MatchSquads = model<MatchSquad<MatchSquadPlayer>>(
  "MatchSquad",
  matchSquadsSchema
);

export default MatchSquads;
