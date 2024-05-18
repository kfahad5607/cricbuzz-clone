import { Schema, model } from "mongoose";
import { DBIdType, PositiveNumberType } from "../schemaTypes";
import { BALL_EVENTS } from "../constants";

const commentaryItemSchema = new Schema({
  overNumber: PositiveNumberType,
  commText: String,
  events: [{ type: String, enum: BALL_EVENTS }],
});

const commentarySchema = new Schema({
  matchId: DBIdType,
  innings: [
    new Schema({
      teamId: DBIdType,
      commentary: [commentaryItemSchema],
    }),
  ],
});

const Commentary = model("Commentary", commentarySchema);

export default Commentary;
