import { Component, computed, inject, signal } from '@angular/core';
import { Player } from '@player/models/player';
import { GAME_SETUP_CONTEXT, GameSetupContext } from '@game/game-setup-context';
import { PlayerSelectionComponent } from '@player/player-selection/player-selection.component';
import { FormFieldComponent } from '@ui/form-field/form-field.component';
import { SelectComponent, SelectOption } from '@ui/select/select.component';
import { ScoringConfigStore } from '../../config/scoring-config.store';
import { ScoringConfig } from '../../_shared/models/scoring-config';

/**
 * The end-game type's one-screen setup (the descriptor's `setupComponent`): pick the scoring
 * rule set from a dropdown and select players in a single step, then launch the game through
 * {@link GameSetupContext.start} with the chosen {@link ScoringConfig}. Rule sets themselves are
 * created/edited from the always-available toolbar manager; the dropdown is signal-backed, so a
 * config added there appears immediately and a deleted selection falls back to the first set.
 */
@Component({
  selector: 'st-end-game-setup',
  imports: [FormFieldComponent, SelectComponent, PlayerSelectionComponent],
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

  protected readonly configOptions = computed<SelectOption<string>[]>(() =>
    this.configs().map((config) => ({ value: config.id, label: config.name })),
  );

  /** `id` mirrors `st-select`'s `valueChange` type (`T | null`, for the no-selection
   *  placeholder state); a config is always pre-selected here, so `null` never
   *  actually fires — the guard exists only to satisfy that type. */
  select(id: string | null): void {
    if (id) {
      this.selectedId.set(id);
    }
  }

  start(players: Player[]): void {
    const config = this.selectedConfig();
    if (config) {
      this.context.start(players, config);
    }
  }
}
