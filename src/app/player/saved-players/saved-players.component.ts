import { Component, afterNextRender, inject, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { PlayerBase } from '@player/models/player-base';
import { PlayerPreference } from '@player/models/player-preference';
import { ButtonComponent } from '@ui/button/button.component';
import { SavedPlayerService } from '@player/saved-player.service';
import { SavedPlayerFormComponent } from './saved-player-form.component';
import { SavedPlayerRowComponent } from './saved-player-row.component';

@Component({
  selector: 'st-saved-players',
  imports: [NgIcon, ButtonComponent, SavedPlayerFormComponent, SavedPlayerRowComponent],
  templateUrl: './saved-players.component.html',
  styleUrl: './saved-players.component.scss',
})
export class SavedPlayersComponent {
  readonly savedPlayerService = inject(SavedPlayerService);

  // Which existing player's row is toggled into edit mode (by id), and whether the
  // "add" row is open at the top. Only one editor is ever active, so a single
  // field drives whichever row is currently editing.
  readonly editingId = signal<number | null>(null);
  readonly adding = signal(false);

  // Flips true right after the panel's first render, so the initial batch of rows mounts
  // without an enter animation — only rows added/re-shown afterward (add, cancel-edit) animate.
  readonly rowsReady = signal(false);

  constructor() {
    afterNextRender(() => this.rowsReady.set(true));
  }

  onAdd(): void {
    this.editingId.set(null);
    this.adding.set(true);
  }

  onEdit(player: PlayerPreference): void {
    this.adding.set(false);
    this.editingId.set(player.playerPreferenceId);
  }

  onDelete(player: PlayerPreference): void {
    this.savedPlayerService.removePlayer(player.playerPreferenceId);
    if (this.editingId() === player.playerPreferenceId) {
      this.cancel();
    }
  }

  onSave(identity: PlayerBase): void {
    if (this.adding()) {
      this.savedPlayerService.addPlayer(identity);
    } else {
      const existing = this.savedPlayerService
        .savedPlayers()
        .find((p) => p.playerPreferenceId === this.editingId());
      if (existing) {
        this.savedPlayerService.editPlayer(Object.assign(existing, identity));
      }
    }
    this.cancel();
  }

  cancel(): void {
    this.adding.set(false);
    this.editingId.set(null);
  }
}
