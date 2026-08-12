import { Component, effect, inject, output, signal, untracked } from '@angular/core';
import { ValidationError, applyEach, form, required, validateTree } from '@angular/forms/signals';
import { Player } from '@player/models/player';
import { PlayerHelper } from '@player/models/player-helper';
import { DEFAULT_PLAYER_COUNT } from '@core/injection-tokens/default-player-count';
import { ButtonComponent } from '@ui/button/button.component';
import { NumberPickerComponent } from '@ui/number-picker/number-picker.component';
import { ColorDirective } from '@color/color.directive';
import { PlayerInfoComponent } from '@player/player-info/player-info.component';
import { ColorHelper } from '@color/models/color-helper';

@Component({
  selector: 'st-player-selection',
  imports: [ButtonComponent, NumberPickerComponent, ColorDirective, PlayerInfoComponent],
  templateUrl: './player-selection.component.html',
  styleUrl: './player-selection.component.scss',
})
export class PlayerSelectionComponent {
  readonly selectPlayers = output<Player[]>();

  private readonly defaultPlayerCount = inject(DEFAULT_PLAYER_COUNT);

  readonly players = signal<Player[]>([]);
  readonly playerCount = signal(this.defaultPlayerCount);

  readonly playersField = form(this.players, (players) => {
    applyEach(players, (player) => {
      required(player.name, { message: 'Player name is required' });
      required(player.color, { message: 'Player color is required' });
    });
    validateTree(players, ({ value }) => PlayerSelectionComponent.uniquePlayerErrors(value()));
  });

  constructor() {
    // Resize the player list to match the count picker. Reads/writes `players` untracked so
    // the effect tracks only `playerCount`, not the per-row edits the form writes back.
    effect(() => {
      const count = this.playerCount();
      untracked(() => this.setPlayers(count));
    });
  }

  /** Unique-constraint messages, surfaced under the list. */
  formErrors(): string[] {
    return this.playersField()
      .errors()
      .map((error) => error.message)
      .filter((message): message is string => !!message);
  }

  setPlayers(count: number): void {
    const current = this.players();

    if (count > current.length) {
      const additions: Player[] = [];
      for (let i = current.length; i < count; i++) {
        additions.push(PlayerHelper.blank(i + 1));
      }
      this.players.set([...current, ...additions]);
    } else if (count < current.length) {
      this.players.set(current.slice(0, count));
    }
  }

  submitForm(): void {
    this.playersField().markAsTouched();
    if (this.playersField().valid()) {
      this.selectPlayers.emit(this.playersField().value());
    }
  }

  /** Cross-field rule: every player must have a unique name and a unique color. */
  private static uniquePlayerErrors(players: Player[]): ValidationError.WithoutFieldTree[] {
    let duplicateName = false;
    let duplicateColor = false;

    players.forEach((player, i) => {
      players.forEach((other, j) => {
        if (i === j) {
          return;
        }
        if (player.name && other.name === player.name) {
          duplicateName = true;
        }
        if (player.color && ColorHelper.sameColor(other.color, player.color)) {
          duplicateColor = true;
        }
      });
    });

    const errors: ValidationError.WithoutFieldTree[] = [];
    if (duplicateName) {
      errors.push({ kind: 'duplicateName', message: 'All player names must be unique' });
    }
    if (duplicateColor) {
      errors.push({ kind: 'duplicateColor', message: 'All player colors must be unique' });
    }
    return errors;
  }
}
