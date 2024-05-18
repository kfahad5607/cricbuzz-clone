import { Schema, model } from "mongoose";
import { DBIdType, PositiveNumberType } from "../schemaTypes";

const dismissalTypeEnum = [
  "bowled",
  "caught",
  "lbw",
  "run-out",
  "stumped",
  "retired",
  "hit-the-ball-twice",
  "hit-wicket",
  "obstruct-field",
  "handled-ball",
  "timed-out",
];

const scorecardBatterSchema = new Schema({
  batterId: DBIdType,
  batRuns: PositiveNumberType,
  ballsPlayed: PositiveNumberType,
  batFours: PositiveNumberType,
  batSixes: PositiveNumberType,
  fallOfWicket: new Schema({
    dismissalType: {
      type: String,
      enum: dismissalTypeEnum,
    },
    ballNum: PositiveNumberType,
    teamScoreLine: String,
    bowler: String,
    helpers: [PositiveNumberType],
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

const extraBallsSchema = new Schema({
  nos: PositiveNumberType,
  wides: PositiveNumberType,
  legByes: PositiveNumberType,
  byes: PositiveNumberType,
  penalties: PositiveNumberType,
});

const scorecardSchema = new Schema({
  innings: [
    new Schema({
      teamId: DBIdType,
      overs: PositiveNumberType,
      oversBowled: PositiveNumberType,
      score: PositiveNumberType,
      wickets: PositiveNumberType,
      isDeclared: Boolean,
      isFollowOn: Boolean,
      batters: [scorecardBatterSchema],
      bowlers: [scorecardBowlerSchema],
      extras: extraBallsSchema,
    }),
  ],
});

const Scorecard = model("Scorecard", scorecardSchema);

export default Scorecard;
