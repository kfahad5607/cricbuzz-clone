import { Schema, model } from "mongoose";
import { DBIdType } from "../schemaTypes";

const squadPlayerSchema = new Schema({
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
});

const matchSquadsSchema = new Schema({
  matchId: DBIdType,
  teams: [
    new Schema({
      teamId: DBIdType,
      players: [squadPlayerSchema],
    }),
  ],
});

const MatchSquads = model("MatchSquad", matchSquadsSchema);

export default MatchSquads;
