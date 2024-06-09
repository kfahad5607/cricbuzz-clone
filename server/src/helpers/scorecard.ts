import {
  BaseScorecardInnings,
  BaseScorecardKeys,
  BatterHolderKeys,
  BatterKeys,
  BowlerHolderKeys,
  BowlerKeys,
  ScorecardBatter,
  ScorecardBowler,
} from "../types/scorecard";

// const
export const baseScorecardKeys: BaseScorecardKeys[] =
  BaseScorecardInnings.keyof().options;

export const batterHolderKeys: BatterHolderKeys[] = [
  "batsmanStriker",
  "batsmanNonStriker",
];

export const bowlerHolderKeys: BowlerHolderKeys[] = [
  "bowlerStriker",
  "bowlerNonStriker",
];

export const batterKeys: BatterKeys[] = ScorecardBatter.keyof().options;
export const bowlerKeys: BowlerKeys[] = ScorecardBowler.keyof().options;

// Operations based
export function addScorecardPlayers<PlayerT extends { id: number }>(
  players: PlayerT[],
  currentPlayer: PlayerT,
  keys: (keyof PlayerT)[]
) {
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (player.id === currentPlayer.id) {
      keys.forEach((key) => {
        let val = currentPlayer[key];
        if (val !== undefined) player[key] = val;
      });
      return players;
    }
  }

  players.push(currentPlayer);

  return players;
}
