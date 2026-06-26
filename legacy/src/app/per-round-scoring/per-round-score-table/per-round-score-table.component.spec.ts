import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PerRoundScoreTableComponent } from './per-round-score-table.component';
import { ClarityModule } from '@clr/angular';
import { PerRoundScoringService } from '../providers/per-round-scoring.service';
import { GameRound } from '../models/game-round';
import { By } from '@angular/platform-browser';
import { Player } from '@models/player';
import { PlayerScores } from '../models/player-scores';
import { DebugElement } from '@angular/core';
import { ModalService } from '@util/modal/modal.service';
import { NumberModalComponent } from '@util/number-modal/number-modal.component';

describe('PerRoundScoreTableComponent', () => {
  let fixture: ComponentFixture<PerRoundScoreTableComponent>;
  let component: PerRoundScoreTableComponent;
  let scoringService: jasmine.SpyObj<PerRoundScoringService>;
  let modalService: jasmine.SpyObj<ModalService>;

  function createRounds(num: number): GameRound[] {
    const rounds = [];
    for (let i = 1; i <= num; i++) {
      rounds.push(new GameRound(i));
    }

    return rounds;
  }

  function createPlayers(num: number): Player[] {
    const players = [];
    for (let i = 1; i <= num; i++) {
      const player = new Player(i);
      player.name = `Player #${i}`;
      players.push(player);
    }

    return players;
  }

  function createPlayerScores(players: Player[]): PlayerScores[] {
    const scores: PlayerScores[] = [];
    players.forEach(p => scores.push(new PlayerScores(p)));
    return scores;
  }

  function populateTableData(): { players: Player[], scores: PlayerScores[], rounds: GameRound[] } {
    const rounds = createRounds(3);
    scoringService.roundList.and.returnValue(rounds);
    const players = createPlayers(2);
    scoringService.playerList.and.returnValue(players.map(p => p.name));
    const scores = createPlayerScores(players);
    scores[ 0 ].addRoundScore(1, 4);
    scores[ 0 ].addRoundScore(2, 5);
    scores[ 0 ].addRoundScore(3, 6);
    scores[ 1 ].addRoundScore(1, 2);
    scores[ 1 ].addRoundScore(2, 8);
    scoringService.scoreList.and.returnValue(scores);

    return { players, scores, rounds };
  }

  function verifyRowCells(ele: DebugElement, values: string[]): void {
    const cells = ele.queryAll(By.css('th,td'));
    for (let i = 0; i < values.length; i++) {
      const cellText = cells[ i ].nativeElement.innerText;
      if (!values[ i ]) {
        expect(cellText).toEqual('');
      } else {
        expect(cellText).toContain(values[ i ]);
      }
    }
  }

  beforeEach(() => {
    scoringService = jasmine.createSpyObj('PerRoundScoringService', [ 'roundList', 'playerList', 'scoreList', 'modifyScore' ]);
    scoringService.roundList.and.returnValue([]);
    scoringService.playerList.and.returnValue([]);
    scoringService.scoreList.and.returnValue([]);

    modalService = jasmine.createSpyObj('ModalService', [ 'createModalOfType' ]);

    TestBed.configureTestingModule({
      declarations: [ PerRoundScoreTableComponent ],
      imports: [ ClarityModule ],
      providers: [
        { provide: PerRoundScoringService, useValue: scoringService },
        { provide: ModalService, useValue: modalService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerRoundScoreTableComponent);
    component = fixture.debugElement.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show a row for each round', () => {
    scoringService.roundList.and.returnValue(createRounds(5));
    fixture.detectChanges();
    const tableRows = fixture.debugElement.queryAll(By.css('tr'));

    expect(tableRows.length).toEqual(7); // Add row for header and totals
    expect(fixture.debugElement.query(By.css('btn')));
  });

  it('should show an expand button and truncate rows if more than 10', () => {
    scoringService.roundList.and.returnValue(createRounds(13));
    fixture.detectChanges();

    let tableRows = fixture.debugElement.queryAll(By.css('tr'));
    const expandButton = fixture.debugElement.query(By.css('button'));

    expect(tableRows.length).toEqual(12);
    expect(expandButton).toBeTruthy();
    expect(expandButton.nativeElement.innerText).toContain('EXPAND');

    expandButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    tableRows = fixture.debugElement.queryAll(By.css('tr'));
    expect(tableRows.length).toEqual(15);
    expect(expandButton).toBeTruthy();
    expect(expandButton.nativeElement.innerText).toContain('SHOW FEWER');
  });

  it('should show the scores for each round', () => {
    const { players } = populateTableData();

    fixture.detectChanges();

    const tableRows = fixture.debugElement.queryAll(By.css('tr'));
    verifyRowCells(tableRows[ 0 ], [ 'Round', players[ 0 ].name, players[ 1 ].name ]);
    verifyRowCells(tableRows[ 1 ], [ 'Round #1', '4', '2' ]);
    verifyRowCells(tableRows[ 2 ], [ 'Round #2', '5', '8' ]);
    verifyRowCells(tableRows[ 3 ], [ 'Round #3', '6', null ]);
    verifyRowCells(tableRows[ 4 ], [ 'Total', '15', '10' ]);
  });

  it('should modify existing scores on resolve', fakeAsync(() => {
    modalService.createModalOfType.and.returnValue({ result: Promise.resolve(5) });
    const { players } = populateTableData();

    fixture.detectChanges();

    const scoreButtons = fixture.debugElement.queryAll(By.css('.score-button'));
    scoreButtons[ 3 ].triggerEventHandler('click', null);
    tick();
    tick();

    expect(modalService.createModalOfType).toHaveBeenCalledWith(NumberModalComponent, { title: 'Edit Score for Player #2 - Round #2' });
    expect(scoringService.modifyScore).toHaveBeenCalledWith(players[ 1 ], 2, 5);
  }));

  it('should not modify existing scores on reject', fakeAsync(() => {
    modalService.createModalOfType.and.returnValue({ result: Promise.reject() });
    populateTableData();

    fixture.detectChanges();

    const scoreButtons = fixture.debugElement.queryAll(By.css('.score-button'));
    scoreButtons[ 3 ].triggerEventHandler('click', null);
    tick();

    expect(modalService.createModalOfType).toHaveBeenCalled();
    expect(scoringService.modifyScore).not.toHaveBeenCalled();
  }));
});
