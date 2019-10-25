import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerRoundScoringComponent } from './per-round-scoring.component';
import { Component, EventEmitter, Output } from '@angular/core';
import { PerRoundScoringService } from './providers/per-round-scoring.service';
import { By } from '@angular/platform-browser';
import { Player } from '@models/player';

@Component({
  selector: 'st-per-round-scoring-game',
  template: ''
})
export class TestPerRoundScoringGameComponent {}

@Component({
  selector: 'st-player-selection',
  template: ''
})
export class TestPlayerSelectionComponent {
  @Output() selectPlayers = new EventEmitter<Player[]>();
}

describe('PerRoundScoringComponent', () => {
  let fixture: ComponentFixture<PerRoundScoringComponent>;
  let component: PerRoundScoringComponent;
  let mockGameService: jasmine.SpyObj<PerRoundScoringService>;

  beforeEach(() => {
    mockGameService = jasmine.createSpyObj('PerRoundScoringService', [ 'gameInitialized', 'startGame' ]);
    TestBed.configureTestingModule({
      declarations: [
        PerRoundScoringComponent,
        TestPerRoundScoringGameComponent,
        TestPlayerSelectionComponent
      ]
    });

    TestBed.overrideComponent(PerRoundScoringComponent, {
      set: {
        providers: [
          { provide: PerRoundScoringService, useValue: mockGameService }
        ]
      }
    });

    fixture = TestBed.createComponent(PerRoundScoringComponent);
    component = fixture.debugElement.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show player selection when the game is not initialized', () => {
    mockGameService.gameInitialized.and.returnValue(false);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(TestPlayerSelectionComponent))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(TestPerRoundScoringGameComponent))).toBeFalsy();
  });

  it('should show the game when the game is initialized', () => {
    mockGameService.gameInitialized.and.returnValue(true);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(TestPlayerSelectionComponent))).toBeFalsy();
    expect(fixture.debugElement.query(By.directive(TestPerRoundScoringGameComponent))).toBeTruthy();
  });

  it('should initialize the game when players are selected', () => {
    mockGameService.gameInitialized.and.returnValue(false);
    const players = [
      new Player(2), new Player(4), new Player(3)
    ];
    const playerSelection = fixture.debugElement.query(By.directive(TestPlayerSelectionComponent))
      .componentInstance as TestPlayerSelectionComponent;
    playerSelection.selectPlayers.emit(players);
    expect(mockGameService.startGame).toHaveBeenCalledWith(players);
  });
});
