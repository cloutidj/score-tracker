import { PlayerPreference } from '@models/player-preference';
import { FormControl } from '@angular/forms';
import { SavedPlayerService } from '@player/saved-player.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'st-saved-player-select',
  template: `
  <clr-select-container>
    <label>Import From Saved Player</label>
    <select clrSelect [formControl]="playerControl">
      <option *ngFor="let player of savedPlayerService.getSavedPlayers() | async" [ngValue]="player">
        {{player.name}}
      </option>
    </select>
  </clr-select-container>`
})
export class SavedPlayerSelectComponent implements OnInit {
  @Output() selectPlayer = new EventEmitter<PlayerPreference>();
  public playerControl = new FormControl();

  constructor(public savedPlayerService: SavedPlayerService) { }

  ngOnInit(): void {
    this.playerControl.valueChanges.subscribe(val => {
      if (val) {
        this.selectPlayer.emit(val);
      }
      this.playerControl.setValue(null, { emitEvent: false });
    });
  }
}
