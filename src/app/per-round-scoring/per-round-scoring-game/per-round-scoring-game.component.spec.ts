import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerRoundScoringGameComponent } from './per-round-scoring-game.component';
import { PlayerScoreComponent } from '@forms/player-score/player-score.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PerRoundScoringService } from '../providers/per-round-scoring.service';
import { Player } from '@models/player';
import { By } from '@angular/platform-browser';

describe('PerRoundScoringGameComponent', () => {
  let fixture: ComponentFixture<PerRoundScoringGameComponent>;
  let component: PerRoundScoringGameComponent;
  let scoringService: jasmine.SpyObj<PerRoundScoringService>;

  beforeEach(() => {
    scoringService = jasmine.createSpyObj('PerRoundScoringService', [ 'currentPlayer', 'addScore' ]);
    scoringService.currentPlayer.and.returnValue(new Player(2));

    TestBed.configureTestingModule({
      declarations: [ PerRoundScoringGameComponent, PlayerScoreComponent ],
      providers: [
        { provide: PerRoundScoringService, useValue: scoringService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerRoundScoringGameComponent);
    component = fixture.debugElement.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should bind the current player to the scoring component', () => {
    const scoringComp = fixture.debugElement.query(By.directive(PlayerScoreComponent)).componentInstance as PlayerScoreComponent;
    expect(scoringComp.player).toEqual(scoringService.currentPlayer());
  });

  it('should call add score', () => {
    const scoringComp = fixture.debugElement.query(By.directive(PlayerScoreComponent)).componentInstance as PlayerScoreComponent;
    scoringComp.score.emit(5);
    expect(scoringService.addScore).toHaveBeenCalled();
  });
});
