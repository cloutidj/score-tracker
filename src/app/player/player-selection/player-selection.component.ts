import { Component, effect, inject, output, signal, untracked } from '@angular/core';
import { applyEach, form, required, validateTree, ValidationError } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Player, blankPlayer } from '@player/models/player';
import { PlayerColor } from '@player/models/player-color';
import { DEFAULT_PLAYER_COUNT } from '@core/injection-tokens';
import { NumberPickerComponent } from '@ui/number-picker/number-picker.component';
import { PlayerColorDirective } from '@player/colors/player-color.directive';
import { PlayerInfoComponent } from '@player/player-info/player-info.component';

/**
 * Compare two player colors by value, not reference: an imported color and a picked color
 * are distinct objects, so identity (`===`) would miss a duplicate. The RGB triple is the
 * value identity.
 */
function sameColor(a?: PlayerColor, b?: PlayerColor): boolean {
  return !!a && !!b && a.red === b.red && a.green === b.green && a.blue === b.blue;
}

/** Cross-field rule: every player must have a unique name and a unique color. */
function uniquePlayerErrors(players: Player[]): ValidationError.WithoutFieldTree[] {
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
      if (player.color && sameColor(other.color, player.color)) {
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

@Component({
  selector: 'st-player-selection',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    NumberPickerComponent,
    PlayerColorDirective,
    PlayerInfoComponent,
  ],
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
    validateTree(players, ({ value }) => uniquePlayerErrors(value()));
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
        additions.push(blankPlayer(i + 1));
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
}
