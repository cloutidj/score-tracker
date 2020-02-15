import { PlayerPreference } from '@models/player-preference';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PlayerSelectionComponent } from '@forms/player-selection/player-selection.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UtilModule } from '@util/util.module';
import { ClarityModule } from '@clr/angular';
import { DEFAULT_PLAYER_COUNT, PLAYER_COLOR_LIST } from '@util/injection-tokens';
import { PlayerInfoComponent } from '@forms/player-info/player-info.component';
import { By } from '@angular/platform-browser';
import { Player } from '@models/player';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PlayerColor } from '@models/player-color';
import { FormDirective } from '@forms/directives/form.directive';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PlayerSelectionComponent', () => {
  let fixture: ComponentFixture<PlayerSelectionComponent>;
  let component: PlayerSelectionComponent;
  const colors = [
    new PlayerColor(0, 0, 0),
    new PlayerColor(1, 2, 3)
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerSelectionComponent, PlayerInfoComponent, FormDirective],
      imports: [ReactiveFormsModule, UtilModule, ClarityModule, NoopAnimationsModule],
      providers: [
        { provide: DEFAULT_PLAYER_COUNT, useValue: 3 },
        { provide: PLAYER_COLOR_LIST, useValue: colors }
      ],
      schemas: [NO_ERRORS_SCHEMA]
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

  it('should set the number of players when emitting the same value', () => {
    component.playerCountForm.setValue({ playerCount: 3 });
    const playerForms = fixture.debugElement.queryAll(By.directive(PlayerInfoComponent));
    expect(playerForms.length).toEqual(3);
  });

  it('should show an icon for the status of the player', () => {
    component.playersFormArray.controls[0].setValue({ name: 'Jake', color: new PlayerColor(9, 9, 9) });
    component.playersFormArray.controls[1].setErrors({ customError: true });

    fixture.detectChanges();

    const playerFormCards = fixture.debugElement.queryAll(By.css('.card'));
    expect(playerFormCards[0].query(By.css('clr-icon.is-success'))).toBeTruthy();
    expect(playerFormCards[1].query(By.css('clr-icon.is-warning'))).toBeTruthy();
  });

  it('should show invalid for duplicate names', () => {
    component.playerCountForm.setValue({ playerCount: 2 });
    fixture.detectChanges();
    component.playersFormArray.controls[0].setValue({ name: 'Frank', color: colors[0] });
    component.playersFormArray.controls[1].setValue({ name: 'Frank', color: colors[1] });
    fixture.detectChanges();

    expect(component.playersFormArray.hasError('duplicateName')).toBeTruthy();
  });

  it('should populate from saved players', () => {
    const playerPref = new PlayerPreference();
    playerPref.name = 'Tim';
    component.populatePlayer(1, playerPref);
    expect(component.playersFormArray.controls[1].value.name).toEqual('Tim');
  });

  it('should show invalid for duplicate colors', () => {
    component.playerCountForm.setValue({ playerCount: 2 });
    fixture.detectChanges();
    component.playersFormArray.controls[0].setValue({ name: 'Jake', color: colors[1] });
    component.playersFormArray.controls[1].setValue({ name: 'Frank', color: colors[1] });
    fixture.detectChanges();

    expect(component.playersFormArray.hasError('duplicateColor')).toBeTruthy();
  });

  it('should emit the player data', (done: DoneFn) => {
    component.playerCountForm.setValue({ playerCount: 2 });
    fixture.detectChanges();
    component.playersFormArray.controls[0].setValue({ name: 'Jake', color: colors[0] });
    component.playersFormArray.controls[1].setValue({ name: 'Frank', color: colors[1] });
    fixture.detectChanges();

    component.selectPlayers.subscribe((p: Player[]) => {
      expect(p.length).toEqual(2);
      expect(p[0].name).toEqual('Jake');
      expect(p[1].name).toEqual('Frank');
      done();
    });

    fixture.debugElement.query(By.css('button.btn-success')).triggerEventHandler('click', null);
  });

  it('should not emit data with an invalid form', () => {
    component.playerCountForm.setErrors({ dummy: true });
    fixture.debugElement.query(By.css('button.btn-success')).triggerEventHandler('click', null);
    component.selectPlayers.subscribe(() => fail('Should not emit'));
  });

  it('should emit control touch event on submit', (done: DoneFn) => {
    component.formDirective.touchEvent().subscribe(() => done());
    fixture.debugElement.query(By.css('button.btn-success')).triggerEventHandler('click', null);
  });
});
