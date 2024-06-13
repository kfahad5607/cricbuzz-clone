import { Schema, model } from "mongoose";
import { DBIdType, PositiveNumberType } from "../schemaTypes";
import { BALL_EVENTS } from "../constants";
import { batterSchemaObj, bowlerSchemaObj } from "./scorecard";

const commentaryItemSchema = new Schema({
  timestamp: Number,
  overs: PositiveNumberType,
  commText: String,
  events: [{ type: String, enum: BALL_EVENTS }],
  batsmanStriker: batterSchemaObj,
  bowlerStriker: bowlerSchemaObj,
});

const commentarySchema = new Schema({
  matchId: DBIdType,
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
