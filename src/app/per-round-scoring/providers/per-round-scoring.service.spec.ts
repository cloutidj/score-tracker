import { PerRoundScoringService, ScoreChangeType } from './per-round-scoring.service';
import { Player } from '@models/player';
import { GameRound } from '../models/game-round';

describe('PerRoundScoringService', () => {
  let service: PerRoundScoringService;
  const players: Player[] = [
    new Player(1), new Player(2), new Player(3)
  ];
  players[ 0 ].name = 'Frank';
  players[ 1 ].name = 'Jeff';
  players[ 2 ].name = 'Sally';

  beforeEach(() => {
    service = new PerRoundScoringService();
  });

  it('should not be initialized at the start', () => {
    expect(service.gameInitialized()).toEqual(false);
  });

  it('should initialize the game and chart data', () => {
    service.startGame(players);

    expect(service.gameInitialized()).toEqual(true);
    expect(service.currentPlayer()).toEqual(players[ 0 ]);
    expect(service.playerList()).toEqual([ 'Frank', 'Jeff', 'Sally' ]);
    expect(service.roundList()).toEqual([]);

    const scores = service.scoreList();
    expect(scores.length).toEqual(players.length);
    expect(scores[ 0 ].player).toEqual(players[ 0 ]);

    expect(service.lineChartData().labels).toEqual([ 'Start' ]);
    expect(service.barChartData().labels).toEqual([ 'Score Totals' ]);
  });

  it('should add a score and move to the next player', () => {
    service.startGame(players);
    service.addScore(5);

    expect(service.currentPlayer()).toEqual(players[ 1 ]);

    service.addScore(6);

    expect(service.currentPlayer()).toEqual(players[ 2 ]);

    service.addScore(7);

    expect(service.currentPlayer()).toEqual(players[ 0 ]);

    expect(service.scoreList()[ 0 ].total()).toEqual(5);
    expect(service.scoreList()[ 1 ].total()).toEqual(6);
    expect(service.scoreList()[ 2 ].total()).toEqual(7);
  });

  it('should add additional score to a new round', () => {
    service.startGame(players);
    service.addScore(5);
    service.addScore(6);
    service.addScore(7);
    service.addScore(8);

    expect(service.roundList()).toEqual([ new GameRound(1), new GameRound(2) ]);
    expect(service.scoreList()[ 0 ].total()).toEqual(13);
  });

  it('should emit an event when adding a score', (done: DoneFn) => {
    service.scoreChangeEvent().subscribe(e => {
      if (e === ScoreChangeType.Add) {
        done();
      }
    });

    service.startGame(players);
    service.addScore(5);
  });

  it('should modify a previous score without changing current player', () => {
    service.startGame(players);
    service.addScore(5);
    service.addScore(6);
    service.addScore(7);
    service.addScore(8);
    service.addScore(9);
    service.modifyScore(players[ 0 ], 1, 10);

    expect(service.currentPlayer()).toEqual(players[ 2 ]);
    expect(service.scoreList()[ 0 ].total()).toEqual(18);
  });

  it('should emit an event when changing a score', (done: DoneFn) => {
    service.scoreChangeEvent().subscribe(e => {
      if (e === ScoreChangeType.Modify) {
        done();
      }
    });

    service.startGame(players);
    service.addScore(5);
    service.addScore(6);
    service.modifyScore(players[ 1 ], 1, 7);
  });
});
