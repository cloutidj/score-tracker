import { PlayerBase } from '@models/player-base';
import { PlayerColor } from '@models/player-color';
import { UtilModule } from '@util/util.module';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ClarityModule } from '@clr/angular';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SavedPlayersComponent } from './saved-players.component';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PlayerPreference } from '@models/player-preference';
import { By } from '@angular/platform-browser';
import { SavedPlayerService } from '../saved-player.service';
import { of } from 'rxjs';

@Component({
  selector: 'st-player-preferences-form',
  template: ''
})
class MockPlayerPrefsComponent {
  @Input() playerData: PlayerPreference;
  @Output() save = new EventEmitter<PlayerPreference>();
  @Output() cancel = new EventEmitter<void>();
}

describe('SavedPlayersComponent', () => {
  let fixture: ComponentFixture<SavedPlayersComponent>;
  let component: SavedPlayersComponent;
  let mockSavedPlayerService: jasmine.SpyObj<SavedPlayerService>;
  const savedPlayers: PlayerPreference[] = [
    new PlayerPreference(), new PlayerPreference(), new PlayerPreference()
  ];
  const color1 = new PlayerColor(255, 0, 0);
  const color2 = new PlayerColor(255, 255, 0);
  savedPlayers[0].color = color1;
  savedPlayers[1].color = color2;
  savedPlayers[2].color = color1;

  beforeEach(() => {
    mockSavedPlayerService = jasmine.createSpyObj('SavedPlayerService', ['getSavedPlayers', 'editPlayer', 'addPlayer', 'removePlayer']);
    mockSavedPlayerService.getSavedPlayers.and.returnValue(of(savedPlayers));
    TestBed.configureTestingModule({
      declarations: [SavedPlayersComponent, MockPlayerPrefsComponent],
      imports: [ClarityModule, NoopAnimationsModule, UtilModule],
      providers: [
        { provide: SavedPlayerService, useValue: mockSavedPlayerService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SavedPlayersComponent);
    component = fixture.debugElement.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should get unique colors', () => {
    expect(component.distinctColors(savedPlayers)).toEqual([color1, color2]);
  });

  it('should show form to add new players and save', fakeAsync(() => {
    component.onAdd();
    fixture.detectChanges();
    const form = fixture.debugElement.query(By.directive(MockPlayerPrefsComponent));
    expect(form).toBeTruthy();
    const newData = new PlayerBase();
    form.componentInstance.save.emit(newData);
    tick();
    expect(mockSavedPlayerService.addPlayer).toHaveBeenCalledWith(newData);
  }));

  it('should show form to edit players and save', fakeAsync(() => {
    component.onEdit(savedPlayers[1]);
    fixture.detectChanges();
    const form = fixture.debugElement.query(By.directive(MockPlayerPrefsComponent));
    expect(form).toBeTruthy();
    savedPlayers[1].name = 'Test';
    form.componentInstance.save.emit(savedPlayers[1]);
    tick();
    expect(mockSavedPlayerService.editPlayer).toHaveBeenCalledWith(savedPlayers[1]);
  }));

  it('should delete players', fakeAsync(() => {
    component.onDelete(savedPlayers[1]);
    expect(mockSavedPlayerService.removePlayer).toHaveBeenCalledWith(savedPlayers[1].playerPreferenceId);
  }));

});
