import { BALLS_IN_OVER } from "./constants";

export const formatBallNum = (ballNum: number): number => {
  let over = Math.trunc(ballNum / BALLS_IN_OVER);
  let ball = ballNum % BALLS_IN_OVER;

  if (ball === 0) {
    ball = 6;
    over--;
  }

  ball = ball / 10;

  return over + ball;
};
