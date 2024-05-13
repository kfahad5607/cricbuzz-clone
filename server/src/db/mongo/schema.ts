import { Schema, model } from "mongoose";

const commentarySchema = new Schema({
  matchId: Number,
  inningsId: String,
});

export const Commentary = model("Commentary", commentarySchema);
