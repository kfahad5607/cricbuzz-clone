import { Schema, model } from "mongoose";
import { DBIdType, DBIdUniqueType } from "../schemaTypes";

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

const matchSquadsSchema = new Schema({
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

const MatchSquads = model("MatchSquad", matchSquadsSchema);

export default MatchSquads;
