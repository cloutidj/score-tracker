import { Component, output, input, linkedSignal } from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { NgIcon } from '@ng-icons/core';
import { PlayerBase } from '@player/models/player-base';
import { Player } from '@player/models/player';
import { PlayerHelper } from '@player/models/player-helper';
import { ButtonComponent } from '@ui/button/button.component';
import { ColorDirective } from '@color/color.directive';
import { PlayerInfoComponent } from '@player/player-info/player-info.component';

/** Add/edit form for one saved player's identity, shown inline in the saved-players list. */
@Component({
  selector: 'st-saved-player-form',
  imports: [NgIcon, ButtonComponent, ColorDirective, PlayerInfoComponent],
  templateUrl: './saved-player-form.component.html',
  styleUrl: './saved-player-form.component.scss',
})
export class SavedPlayerFormComponent {
  // The saved player being edited, or omitted when adding a new one.
  readonly source = input<PlayerBase | null>(null);

  readonly save = output<PlayerBase>();
  readonly cancelled = output<void>();

  // linkedSignal, not a plain signal seeded once: a signal input's bound value isn't
  // available yet when this field initializer runs, only its default — linkedSignal
  // re-derives once `source` actually resolves, instead of getting stuck on blank.
  readonly editModel = linkedSignal<Player>(() =>
    SavedPlayerFormComponent.identityOf(this.source()),
  );
  readonly playerField = form(this.editModel, (player) => {
    required(player.name, { message: 'Player name is required' });
    required(player.color, { message: 'Player color is required' });
  });

  onSave(): void {
    this.playerField().markAsTouched();
    if (!this.playerField().valid()) {
      return;
    }

    const { name, color } = this.editModel();
    this.save.emit({ name, color });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  /** A copy of a saved player's name + color, so edits don't mutate the stored record; blank for a new player. */
  private static identityOf(saved: PlayerBase | null): Player {
    const player = PlayerHelper.blank();
    if (saved) {
      player.name = saved.name;
      player.color = saved.color;
    }
    return player;
  }
}
