import { Schema, model } from "mongoose";
import { PositiveNumberType } from "../schemaTypes";

const battingStatsSchema = new Schema({
  innings: PositiveNumberType,
  notOuts: PositiveNumberType,
  runs: PositiveNumberType,
  balls: PositiveNumberType,
  highestScore: PositiveNumberType,
  centuries: {
    half: PositiveNumberType,
    single: PositiveNumberType,
    double: PositiveNumberType,
  },
  fours: PositiveNumberType,
  sixes: PositiveNumberType,
});

const bowlingStatsSchema = new Schema({
  innings: PositiveNumberType,
  balls: PositiveNumberType,
  runs: PositiveNumberType,
  wickets: PositiveNumberType,
  bestBowlingInnings: String,
  bestBowlingMatch: String,
  fiveWicketsInnings: PositiveNumberType,
  tenWicketsMatch: PositiveNumberType,
});

const playerStatsSchema = new Schema({
  playerId: {
    type: Number,
    min: 1,
    immutable: true,
  },
  profileText: String,
  matches: {
    test: PositiveNumberType,
    odi: PositiveNumberType,
    t20i: PositiveNumberType,
    ipl: PositiveNumberType,
  },
  battingStats: {
    test: battingStatsSchema,
    odi: battingStatsSchema,
    t20i: battingStatsSchema,
    ipl: battingStatsSchema,
  },
  bowlingStats: {
    test: bowlingStatsSchema,
    odi: bowlingStatsSchema,
    t20i: bowlingStatsSchema,
    ipl: bowlingStatsSchema,
  },
});

const PlayerStats = model("PlayerStats", playerStatsSchema);

export default PlayerStats;
