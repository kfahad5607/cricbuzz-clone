import { Schema, model } from "mongoose";
import { DBIdType, DBIdUniqueType, PositiveNumberType } from "../schemaTypes";
import { DISMISSAL_TYPES_VALUES } from "../../../helpers/constants";
import { Scorecard as ScorecardType } from "../../../types/scorecard";

export const batterSchemaObj = {
  id: DBIdType,
  batRuns: PositiveNumberType,
  ballsPlayed: PositiveNumberType,
  dotBalls: PositiveNumberType,
  batFours: PositiveNumberType,
  batSixes: PositiveNumberType,
};

export const bowlerSchemaObj = {
  id: DBIdType,
  bowlOvers: PositiveNumberType,
  bowlMaidens: PositiveNumberType,
  bowlRuns: PositiveNumberType,
  bowlWickets: PositiveNumberType,
  bowlWides: PositiveNumberType,
  bowlNoBalls: PositiveNumberType,
};

const scorecardBatterSchema = new Schema(
  {
    ...batterSchemaObj,
    isStriker: Boolean,
    fallOfWicket: new Schema(
      {
        dismissalType: {
          type: String,
          enum: DISMISSAL_TYPES_VALUES,
        },
        overs: PositiveNumberType,
        teamScore: PositiveNumberType,
        teamWickets: PositiveNumberType,
        bowlerId: { ...DBIdType, required: false },
        helpers: [DBIdType],
      },
      { _id: false }
    ),
  },
  { _id: false }
);

const scorecardBowlerSchema = new Schema(
  { ...bowlerSchemaObj },
  { _id: false }
);

const extraBallSchema = new Schema(
  {
    nos: PositiveNumberType,
    wides: PositiveNumberType,
    legByes: PositiveNumberType,
    byes: PositiveNumberType,
    penalties: PositiveNumberType,
  },
  { _id: false }
);

const scorecardInningsSchema = new Schema(
  {
    teamId: DBIdType,
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
);

const scorecardInningsObjSchema = new Schema(
  {
    first: scorecardInningsSchema,
    second: scorecardInningsSchema,
    third: scorecardInningsSchema,
    fourth: scorecardInningsSchema,
  },
  { _id: false }
);

const scorecardSchema = new Schema<ScorecardType>({
  matchId: DBIdUniqueType,
  // innings: [scorecardInningsSchema],
  innings: {
    type: scorecardInningsObjSchema,
    default: {},
    required: true,
  },
});

const Scorecard = model<ScorecardType>("Scorecard", scorecardSchema);

export default Scorecard;
