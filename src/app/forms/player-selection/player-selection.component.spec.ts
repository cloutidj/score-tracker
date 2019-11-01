import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerSelectionComponent } from '@forms/player-selection/player-selection.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UtilModule } from '@util/util.module';
import { ClarityModule } from '@clr/angular';
import { DEFAULT_PLAYER_COUNT } from '@util/injection-tokens';
import { PlayerInfoComponent } from '@forms/player-info/player-info.component';
import { By } from '@angular/platform-browser';
import { Player } from '@models/player';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PlayerSelectionComponent', () => {
  let fixture: ComponentFixture<PlayerSelectionComponent>;
  let component: PlayerSelectionComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerSelectionComponent, PlayerInfoComponent ],
      imports: [ ReactiveFormsModule, UtilModule, ClarityModule, NoopAnimationsModule ],
      providers: [
        { provide: DEFAULT_PLAYER_COUNT, useValue: 3 }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerSelectionComponent);
    component = fixture.debugElement.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should start with the default number of players', () => {
    const playerForms = fixture.debugElement.queryAll(By.directive(PlayerInfoComponent));
    expect(playerForms.length).toEqual(3);
  });

  it('should set the number of players when increasing a player count', () => {
    component.playerCountForm.setValue({ playerCount: 5 });
    const playerForms = fixture.debugElement.queryAll(By.directive(PlayerInfoComponent));
    expect(playerForms.length).toEqual(5);
  });

  it('should set the number of players when decreasing a player count', () => {
    component.playerCountForm.setValue({ playerCount: 2 });
    const playerForms = fixture.debugElement.queryAll(By.directive(PlayerInfoComponent));
    expect(playerForms.length).toEqual(2);
  });

  it('should show an icon for the status of the player', () => {
    component.playersFormArray.controls[ 0 ].setValue({ name: 'Jake' });
    component.playersFormArray.controls[ 1 ].setErrors({ customError: true });

    fixture.detectChanges();

    const playerFormCards = fixture.debugElement.queryAll(By.css('.card'));
    expect(playerFormCards[ 0 ].query(By.css('clr-icon.is-success'))).toBeTruthy();
    expect(playerFormCards[ 1 ].query(By.css('clr-icon.is-warning'))).toBeTruthy();
  });

  it('should emit the player data', () => {
    component.playerCountForm.setValue({ playerCount: 2 });
    fixture.detectChanges();
    component.playersFormArray.controls[ 0 ].setValue({ name: 'Jake' });
    component.playersFormArray.controls[ 1 ].setValue({ name: 'Frank' });
    fixture.detectChanges();

    component.selectPlayers.subscribe((p: Player[]) => {
      expect(p.length).toEqual(2);
      expect(p[ 0 ].name).toEqual('Jake');
      expect(p[ 1 ].name).toEqual('Frank');
    });

    fixture.debugElement.query(By.css('button.btn-success')).triggerEventHandler('click', null);
  });
});
