import { GameRound } from './game-round';

describe('GameRound', () => {
  it('should create the object', () => {
    expect(new GameRound(1)).toBeTruthy();
  });

  it('should create a display label', () => {
    const round = new GameRound(3);
    expect(round.roundId).toEqual(3);
    expect(round.label).toEqual('Round #3');
  });
});
