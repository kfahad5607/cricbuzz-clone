import { Schema, model } from "mongoose";
import { DBIdType, PositiveNumberType } from "../schemaTypes";
import { DISMISSAL_TYPES_VALUES } from "../../../helpers/constants";

const scorecardBatterSchema = new Schema({
  batterId: DBIdType,
  batRuns: PositiveNumberType,
  ballsPlayed: PositiveNumberType,
  dotBalls: PositiveNumberType,
  batFours: PositiveNumberType,
  batSixes: PositiveNumberType,
  fallOfWicket: new Schema({
    dismissalType: {
      type: String,
      enum: DISMISSAL_TYPES_VALUES,
    },
    ballNum: PositiveNumberType,
    teamScoreLine: String,
    bowlerId: DBIdType,
    helpers: [DBIdType],
  }),
});

const scorecardBowlerSchema = new Schema({
  bowlerId: DBIdType,
  bowlOvers: PositiveNumberType,
  bowlMaidens: PositiveNumberType,
  bowlRuns: PositiveNumberType,
  bowlWickets: PositiveNumberType,
  bowlWides: PositiveNumberType,
  bowlNoBalls: PositiveNumberType,
});

const extraBallSchema = new Schema({
  nos: PositiveNumberType,
  wides: PositiveNumberType,
  legByes: PositiveNumberType,
  byes: PositiveNumberType,
  penalties: PositiveNumberType,
});

const scorecardSchema = new Schema({
  matchId: DBIdType,
  innings: [
    new Schema(
      {
        teamId: DBIdType,
        inningsId: DBIdType,
        overs: PositiveNumberType,
        oversBowled: PositiveNumberType,
        score: PositiveNumberType,
        wickets: PositiveNumberType,
        isDeclared: Boolean,
        isFollowOn: Boolean,
        batters: [scorecardBatterSchema],
        bowlers: [scorecardBowlerSchema],
        extras: extraBallSchema,
        // add target
      },
      { _id: false }
    ),
  ],
});

const Scorecard = model("Scorecard", scorecardSchema);

export default Scorecard;
