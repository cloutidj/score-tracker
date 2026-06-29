import { Component, computed, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Player } from '@models/player';
import { GAME_SETUP_CONTEXT, GameSetupContext } from '@game/game-type';
import { PlayerSelectionComponent } from '@forms/player-selection/player-selection.component';
import { ScoringConfigStore } from '../scoring-config.store';
import { ScoringConfig } from '../models/scoring-config';

/**
 * The end-game type's one-screen setup (the descriptor's `setupComponent`): pick the scoring
 * rule set from a dropdown and select players in a single step, then launch the game through
 * {@link GameSetupContext.start} with the chosen {@link ScoringConfig}. Rule sets themselves are
 * created/edited from the always-available toolbar manager; the dropdown is signal-backed, so a
 * config added there appears immediately and a deleted selection falls back to the first set.
 */
@Component({
  selector: 'st-end-game-setup',
  imports: [MatFormFieldModule, MatSelectModule, PlayerSelectionComponent],
  templateUrl: './end-game-setup.component.html',
  styleUrl: './end-game-setup.component.scss',
})
export class EndGameSetupComponent {
  private readonly context = inject<GameSetupContext<ScoringConfig>>(GAME_SETUP_CONTEXT);
  protected readonly store = inject(ScoringConfigStore);

  protected readonly configs = this.store.configs;

  /** The user's pick; resolved through {@link selectedConfig} so a stale/deleted id self-heals. */
  private readonly selectedId = signal<string | null>(this.store.configs()[0]?.id ?? null);

  /** The effective selection: the picked config, or the first available when none/invalid. */
  protected readonly selectedConfig = computed<ScoringConfig | undefined>(() => {
    const configs = this.configs();
    return configs.find((config) => config.id === this.selectedId()) ?? configs[0];
  });

  select(id: string): void {
    this.selectedId.set(id);
  }

  start(players: Player[]): void {
    const config = this.selectedConfig();
    if (config) {
      this.context.start(players, config);
    }
  }
}
