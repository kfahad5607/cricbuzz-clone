import {
  BaseScorecardInnings,
  BaseScorecardKeys,
  BatterHolderKeys,
  BatterKeys,
  BowlerHolderKeys,
  BowlerKeys,
  ScorecardBatter,
  ScorecardBowler,
  ScorecardInningsEntry,
} from "../types/scorecard";

// const
export const baseScorecardKeys: BaseScorecardKeys[] =
  BaseScorecardInnings.keyof().options;

export const batterHolderKeysEnum = ScorecardInningsEntry.pick({
  batsmanStriker: true,
  batsmanNonStriker: true,
}).keyof();

export const batterHolderKeys: BatterHolderKeys[] =
  batterHolderKeysEnum.options;

export const bowlerHolderKeys: BowlerHolderKeys[] = [
  "bowlerStriker",
  "bowlerNonStriker",
];

export const batterKeys: BatterKeys[] = ScorecardBatter.omit({
  id: true,
}).keyof().options;
export const bowlerKeys: BowlerKeys[] = ScorecardBowler.omit({
  id: true,
}).keyof().options;

// Operations based
export function addScorecardBatter(
  players: ScorecardBatter[],
  currentPlayer: ScorecardBatter
) {
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (player.id === currentPlayer.id) {
      batterKeys.forEach((key) => {
        let val = currentPlayer[key];
        if (val !== undefined) (player[key] as typeof val) = val;
      });

      if (currentPlayer.fallOfWicket) player.isStriker = undefined;
      else player.fallOfWicket = undefined;

      return players;
    }
  }

  players.push(currentPlayer);

  return players;
}

export function addScorecardBowler(
  players: ScorecardBowler[],
  currentPlayer: ScorecardBowler
) {
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (player.id === currentPlayer.id) {
      bowlerKeys.forEach((key) => {
        let val = currentPlayer[key];
        if (val !== undefined) (player[key] as typeof val) = val;
      });
      return players;
    }
  }

  players.push(currentPlayer);

  return players;
}
