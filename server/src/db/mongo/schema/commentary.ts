import { Schema, model } from "mongoose";
import { DBIdType, DBIdUniqueType, PositiveNumberType } from "../schemaTypes";
import { BALL_EVENTS } from "../constants";
import { batterSchemaObj, bowlerSchemaObj } from "./scorecard";

const commentaryItemSchema = new Schema({
  timestamp: {
    type: Number,
    required: true,
  },
  overs: { ...PositiveNumberType, required: true },
  commText: { type: String, required: true },
  events: [{ type: String, enum: BALL_EVENTS }],
  batsmanStriker: {
    type: batterSchemaObj,
    required: true,
  },
  bowlerStriker: {
    type: bowlerSchemaObj,
    required: true,
  },
});

const commentarySchema = new Schema({
  matchId: DBIdUniqueType,
  innings: [
    new Schema(
      {
        teamId: DBIdType,
        commentaryList: [commentaryItemSchema],
      },
      {
        _id: false,
      }
    ),
  ],
});

const Commentary = model("Commentary", commentarySchema);

export default Commentary;
