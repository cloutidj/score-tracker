import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { GAME_CONFIG_CONTEXT, GameConfigContext } from '@game/game-type';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@util/confirm-dialog/confirm-dialog.component';
import { ScoringConfigStore } from '../scoring-config.store';
import { ScoringConfig } from '../models/scoring-config';
import {
  ScoringConfigBuilderComponent,
  ScoringConfigBuilderData,
} from '../config-builder/scoring-config-builder.component';

/**
 * The end-game type's setup step (the descriptor's `configComponent`): pick the scoring
 * configuration to play. Lists the store's configs (built-ins + the user's saved ones);
 * choosing one calls {@link GameConfigContext.complete} to start the game with it. User
 * configs can be edited or deleted, and "Create new" opens the builder — the list is
 * signal-backed, so a save/delete re-renders it immediately.
 */
@Component({
  selector: 'st-scoring-config-select',
  imports: [MatButtonModule, MatCardModule, FontAwesomeModule],
  templateUrl: './scoring-config-select.component.html',
  styleUrl: './scoring-config-select.component.scss',
})
export class ScoringConfigSelectComponent {
  private readonly context = inject<GameConfigContext>(GAME_CONFIG_CONTEXT);
  private readonly dialog = inject(MatDialog);
  protected readonly store = inject(ScoringConfigStore);

  protected readonly configs = this.store.configs;

  /** Start the game with the chosen config. */
  choose(config: ScoringConfig): void {
    this.context.complete(config);
  }

  /** Return to player selection (step 1). */
  back(): void {
    this.context.back();
  }

  create(): void {
    this.openBuilder(null);
  }

  edit(config: ScoringConfig, event: Event): void {
    event.stopPropagation();
    this.openBuilder(config);
  }

  remove(config: ScoringConfig, event: Event): void {
    event.stopPropagation();
    const data: ConfirmDialogData = {
      title: 'Delete configuration',
      message: `Delete "${config.name}"? This can't be undone.`,
      confirmLabel: 'Delete',
    };
    this.dialog
      .open(ConfirmDialogComponent, { data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.store.remove(config.id);
        }
      });
  }

  private openBuilder(config: ScoringConfig | null): void {
    const data: ScoringConfigBuilderData = { config };
    this.dialog.open(ScoringConfigBuilderComponent, { data, width: '34rem', maxWidth: '95vw' });
  }
}
