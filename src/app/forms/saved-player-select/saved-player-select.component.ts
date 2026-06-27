import { Component, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PlayerPreference } from '@models/player-preference';
import { SavedPlayerService } from '@player/saved-player.service';

@Component({
  selector: 'st-saved-player-select',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field>
      <mat-label>Import From Saved Player</mat-label>
      <mat-select [formControl]="playerControl">
        @for (player of savedPlayerService.savedPlayers(); track player.playerPreferenceId) {
          <mat-option [value]="player">{{ player.name }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
})
export class SavedPlayerSelectComponent {
  readonly selectPlayer = output<PlayerPreference>();
  readonly savedPlayerService = inject(SavedPlayerService);
  readonly playerControl = new FormControl<PlayerPreference | null>(null);

  constructor() {
    this.playerControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((player) => {
      if (player) {
        this.selectPlayer.emit(player);
      }
      // Reset so re-selecting the same player fires again.
      this.playerControl.setValue(null, { emitEvent: false });
    });
  }
}
