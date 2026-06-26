import { Component, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { PlayerPreference } from '@models/player-preference';
import { SavedPlayerService } from '@player/saved-player.service';

@Component({
  selector: 'st-saved-player-select',
  imports: [ReactiveFormsModule, ClarityModule],
  template: `
    <clr-select-container>
      <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -->
      <label>Import From Saved Player</label>
      <select clrSelect [formControl]="playerControl">
        @for (player of savedPlayerService.savedPlayers(); track player.playerPreferenceId) {
          <option [ngValue]="player">{{ player.name }}</option>
        }
      </select>
    </clr-select-container>
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
