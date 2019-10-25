import { Player } from '@models/player';
import { PlayerScores } from './player-scores';

describe('PlayerScores', () => {
  const player: Player = new Player(3);
  player.name = 'Andrew';

  it('should create the object', () => {
    expect(new PlayerScores(player)).toBeTruthy();
  });

  it('should initialize chart data', () => {
    const score = new PlayerScores(player);

    expect(score.lineChartSeries.data.length).toEqual(1);
    expect(score.lineChartSeries.data[ 0 ]).toEqual(0);
    expect(score.lineChartSeries.label).toEqual(player.name);

    expect(score.barChartSeries.data.length).toEqual(1);
    expect(score.barChartSeries.data[ 0 ]).toEqual(0);
    expect(score.barChartSeries.label).toEqual(player.name);
  });

  it('should add scores for the round', () => {
    const scores = new PlayerScores(player);
    scores.addRoundScore(1, 5);
    scores.addRoundScore(2, 8);

    expect(scores.hasScoreForRound(2)).toEqual(true);
    expect(scores.roundScore(2)).toEqual(8);
    expect(scores.hasScoreForRound(3)).toEqual(false);
  });

  it('should track the score totals and chart series', () => {
    const scores = new PlayerScores(player);
    scores.addRoundScore(1, 5);
    scores.addRoundScore(2, 8);
    scores.addRoundScore(3, 2);

    expect(scores.total()).toEqual(15);
    expect(scores.lineChartSeries.data).toEqual([ 0, 5, 13, 15 ]);
    expect(scores.barChartSeries.data).toEqual([ 15 ]);
  });

  it('should modify previous scores and update the charts and totals', () => {
    const scores = new PlayerScores(player);
    scores.addRoundScore(1, 5);
    scores.addRoundScore(2, 8);
    scores.addRoundScore(3, 2);
    scores.modifyRoundScore(2, 12);

    expect(scores.total()).toEqual(19);
    expect(scores.lineChartSeries.data).toEqual([ 0, 5, 17, 19 ]);
    expect(scores.barChartSeries.data).toEqual([ 19 ]);
  });
});
