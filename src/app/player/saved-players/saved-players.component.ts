import { Component, afterNextRender, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { form, required } from '@angular/forms/signals';
import { NgIcon } from '@ng-icons/core';
import { PlayerBase } from '@player/models/player-base';
import { Player } from '@player/models/player';
import { PlayerHelper } from '@player/models/player-helper';
import { PlayerPreference } from '@player/models/player-preference';
import { ButtonComponent } from '@ui/button/button.component';
import { IconButtonComponent } from '@ui/icon-button/icon-button.component';
import { ColorDirective } from '@color/color.directive';
import { PlayerInfoComponent } from '@player/player-info/player-info.component';
import { SavedPlayerService } from '@player/saved-player.service';

@Component({
  selector: 'st-saved-players',
  imports: [
    NgTemplateOutlet,
    NgIcon,
    ButtonComponent,
    IconButtonComponent,
    ColorDirective,
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

  // Flips true right after the panel's first render, so the initial batch of rows mounts
  // without an enter animation — only rows added/re-shown afterward (add, cancel-edit) animate.
  readonly rowsReady = signal(false);

  // The identity being edited. The editor row themes live to `editModel().color`
  // because the model is a signal the form writes straight back into.
  readonly editModel = signal<Player>(PlayerHelper.blank());
  readonly playerField = form(this.editModel, (player) => {
    required(player.name, { message: 'Player name is required' });
    required(player.color, { message: 'Player color is required' });
  });

  constructor() {
    afterNextRender(() => this.rowsReady.set(true));
  }

  onAdd(): void {
    this.editingId.set(null);
    this.startEditing(PlayerHelper.blank());
    this.adding.set(true);
  }

  onEdit(player: PlayerPreference): void {
    this.adding.set(false);
    this.startEditing(SavedPlayersComponent.identityOf(player));
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
    this.startEditing(PlayerHelper.blank());
  }

  /** Load a fresh identity into the editor and clear any prior touched/dirty state. */
  private startEditing(identity: Player): void {
    this.editModel.set(identity);
    this.playerField().reset();
  }

  /** A copy of a saved player's name + color, so edits don't mutate the stored record. */
  private static identityOf(saved: PlayerBase): Player {
    const player = PlayerHelper.blank();
    player.name = saved.name;
    player.color = saved.color;
    return player;
  }
}
