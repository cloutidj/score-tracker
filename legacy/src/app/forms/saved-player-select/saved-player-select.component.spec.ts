import { PlayerPreference } from '@models/player-preference';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClarityModule } from '@clr/angular';
import { SavedPlayerSelectComponent } from './saved-player-select.component';
import { SavedPlayerService } from '@player/saved-player.service';
import { of } from 'rxjs';

describe('SavedPlayerSelectComponent', () => {
  let fixture: ComponentFixture<SavedPlayerSelectComponent>;
  let component: SavedPlayerSelectComponent;
  let mockSavedPlayerService: jasmine.SpyObj<SavedPlayerService>;
  const savedPlayers = [
    new PlayerPreference().name = 'Tim',
    new PlayerPreference().name = 'Jake',
    new PlayerPreference().name = 'Sally'
  ];

  beforeEach(() => {
    mockSavedPlayerService = jasmine.createSpyObj('SavedPlayerSelectComponent', ['getSavedPlayers']);
    mockSavedPlayerService.getSavedPlayers.and.returnValue(of(savedPlayers));

    TestBed.configureTestingModule({
      declarations: [SavedPlayerSelectComponent],
      imports: [ReactiveFormsModule, ClarityModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SavedPlayerSelectComponent);
    component = fixture.debugElement.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the selected player and clear', () => {
    component.selectPlayer.subscribe(player => {
      expect(player).toEqual(savedPlayers[1]);
    });

    component.playerControl.setValue(savedPlayers[1]);
  });

  it('should not emit a null selection', () => {
    component.selectPlayer.subscribe(player => {
      fail('should not emit');
    });

    component.playerControl.setValue(null);
  });

});
