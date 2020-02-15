import { PlayerPreference } from '@models/player-preference';
import { PLAYER_COLOR_LIST } from '@util/injection-tokens';
import { SharedFormsModule } from '@forms/shared-forms.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClarityModule } from '@clr/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PlayerPreferencesFormComponent } from './player-preferences-form.component';
import { PlayerColor } from '@models/player-color';

describe('PlayerPreferencesFormComponent', () => {
  let fixture: ComponentFixture<PlayerPreferencesFormComponent>;
  let component: PlayerPreferencesFormComponent;
  const colors = [
    new PlayerColor(0, 0, 0),
    new PlayerColor(1, 2, 3)
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerPreferencesFormComponent],
      imports: [ReactiveFormsModule, ClarityModule, NoopAnimationsModule, SharedFormsModule],
      providers: [
        { provide: PLAYER_COLOR_LIST, useValue: colors }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerPreferencesFormComponent);
    component = fixture.debugElement.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set the form data', () => {
    const playerData = new PlayerPreference();
    playerData.name = 'Tim';
    playerData.color = colors[1];
    component.playerData = playerData;
    fixture.detectChanges();

    expect(component.playerForm.value.player).toEqual(playerData);
  });

  it('should emit the form data on save when valid', (done: DoneFn) => {
    const formData = { name: 'Test', color: colors[1] };
    component.playerForm.patchValue({ player: formData });
    component.save.subscribe(val => {
      expect(val).toEqual(formData);
      done();
    });
    component.saveClick();
  });

  it('should emit the form data on save when valid', () => {
    const formData = { name: 'Test', color: colors[1] };
    component.playerForm.patchValue(formData);
    component.playerForm.setErrors({ err: true });
    component.saveClick();
    component.save.subscribe(() => fail('should not emit'));
  });
});
