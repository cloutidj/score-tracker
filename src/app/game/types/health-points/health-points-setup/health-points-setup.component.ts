import { Component, inject, signal } from '@angular/core';
import { Player } from '@player/models/player';
import { PlayerSelectionComponent } from '@player/player-selection/player-selection.component';
import { GAME_SETUP_CONTEXT, GameSetupContext } from '@game/game-setup-context';
import { FormFieldComponent } from '@ui/form-field/form-field.component';
import { HealthPointsConfig } from '../models/health-points-config';

/** Fallback if the field is cleared or non-positive — the common life total (e.g. Star Realms). */
const DEFAULT_STARTING_LIFE = 50;

/**
 * The health-points type's one-screen setup (the descriptor's `setupComponent`): choose the
 * starting life total (default {@link DEFAULT_STARTING_LIFE}) and select players in a single step,
 * then launch via {@link GameSetupContext.start} with the chosen {@link HealthPointsConfig}.
 */
@Component({
  selector: 'st-health-points-setup',
  imports: [FormFieldComponent, PlayerSelectionComponent],
  templateUrl: './health-points-setup.component.html',
  styleUrl: './health-points-setup.component.scss',
})
export class HealthPointsSetupComponent {
  private readonly context = inject<GameSetupContext<HealthPointsConfig>>(GAME_SETUP_CONTEXT);

  protected readonly startingLife = signal(DEFAULT_STARTING_LIFE);

  /** Keep only a positive whole number; ignore intermediate/invalid input so start always has one. */
  protected setStartingLife(event: Event): void {
    const value = Math.trunc(Number((event.target as HTMLInputElement).value));
    if (Number.isFinite(value) && value > 0) {
      this.startingLife.set(value);
    }
  }

  protected start(players: Player[]): void {
    this.context.start(players, { startingLife: this.startingLife() });
  }
}
