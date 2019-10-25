import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerScoreComponent } from '@forms/player-score/player-score.component';
import { UtilModule } from '@util/util.module';
import { Player } from '@models/player';
import { By } from '@angular/platform-browser';
import { NumberPadComponent } from '@util/number-pad/number-pad.component';

describe('PlayerScoreComponent', () => {
  let fixture: ComponentFixture<PlayerScoreComponent>;
  let component: PlayerScoreComponent;
  const player: Player = new Player(3);
  player.name = 'Frank';

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerScoreComponent ],
      imports: [ UtilModule ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerScoreComponent);
    component = fixture.debugElement.componentInstance;
    component.player = player;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show the players name', () => {
    const titleElement = fixture.debugElement.query(By.css('.card-title'));
    expect(titleElement.nativeElement.innerText).toContain('Frank\'s Turn');
  });

  it('should emit the score when selected', () => {
    const numberPadComponent = fixture.debugElement.query(By.directive(NumberPadComponent)).componentInstance as NumberPadComponent;
    component.score.subscribe(sc => {
      expect(sc).toEqual(8);
    });
    numberPadComponent.score.emit(8);
  });
});
