import { Component, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlayerBase } from '@player/models/player-base';
import { Player, blankPlayer } from '@player/models/player';
import { PlayerPreference } from '@player/models/player-preference';
import { PlayerColorDirective } from '@player/colors/player-color.directive';
import { PlayerInfoComponent } from '@player/player-info/player-info.component';
import { SavedPlayerService } from '@player/saved-player.service';

/** A copy of a saved player's name + color, so edits don't mutate the stored record. */
function identityOf(saved: PlayerBase): Player {
  const player = blankPlayer();
  player.name = saved.name;
  player.color = saved.color;
  return player;
}

@Component({
  selector: 'st-saved-players',
  imports: [
    NgTemplateOutlet,
    MatButtonModule,
    FontAwesomeModule,
    PlayerColorDirective,
    PlayerInfoComponent,
  ],
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

  // The identity being edited. The editor row themes live to `editModel().color`
  // because the model is a signal the form writes straight back into.
  readonly editModel = signal<Player>(blankPlayer());
  readonly playerField = form(this.editModel, (player) => {
    required(player.name, { message: 'Player name is required' });
    required(player.color, { message: 'Player color is required' });
  });

  onAdd(): void {
    this.editingId.set(null);
    this.startEditing(blankPlayer());
    this.adding.set(true);
  }

  onEdit(player: PlayerPreference): void {
    this.adding.set(false);
    this.startEditing(identityOf(player));
    this.editingId.set(player.playerPreferenceId);
  }

  onDelete(player: PlayerPreference): void {
    this.savedPlayerService.removePlayer(player.playerPreferenceId);
    if (this.editingId() === player.playerPreferenceId) {
      this.cancel();
    }
  }

  save(): void {
    this.playerField().markAsTouched();
    if (!this.playerField().valid()) {
      return;
    }

    const { name, color } = this.editModel();
    if (this.adding()) {
      this.savedPlayerService.addPlayer({ name, color });
    } else {
      const existing = this.savedPlayerService
        .savedPlayers()
        .find((p) => p.playerPreferenceId === this.editingId());
      if (existing) {
        this.savedPlayerService.editPlayer(Object.assign(existing, { name, color }));
      }
    }
    this.cancel();
  }

  cancel(): void {
    this.adding.set(false);
    this.editingId.set(null);
    this.startEditing(blankPlayer());
  }

  /** Load a fresh identity into the editor and clear any prior touched/dirty state. */
  private startEditing(identity: Player): void {
    this.editModel.set(identity);
    this.playerField().reset();
  }
}
