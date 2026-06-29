import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Player } from '@models/player';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@util/confirm-dialog/confirm-dialog.component';
import { NumberDialogComponent, NumberDialogData } from '@util/number-dialog/number-dialog.component';
import { PlayerColorDirective } from '@util/colors/player-color.directive';
import {
  CategoryInfoDialogComponent,
  CategoryInfoDialogData,
} from '../category-info-dialog/category-info-dialog.component';
import { CategoryNames } from '../describe-rule';
import { EndGameScoringService } from '../end-game-scoring.service';
import { ScoringCategory } from '../models/scoring-config';

/**
 * End-game scoring view: an editable scoresheet laid out as a CSS grid with categories as rows
 * and players as columns. The category column (short name + info button) is sticky-left while
 * the player columns scroll horizontally; a bottom TOTAL row carries each player's computed
 * total with the leader highlighted. Each cell shows the entered value and, when a rule
 * transforms it, the calculated points (`value → points`). Tapping a cell opens the shared
 * {@link NumberDialogComponent} seeded with the current value; the engine recomputes totals (and
 * the leader) reactively. The info button opens {@link CategoryInfoDialogComponent}.
 */
@Component({
  selector: 'st-end-game-scoring-game',
  imports: [MatButtonModule, FontAwesomeModule, PlayerColorDirective],
  templateUrl: './end-game-scoring-game.component.html',
  styleUrl: './end-game-scoring-game.component.scss',
})
export class EndGameScoringGameComponent {
  readonly gameService = inject(EndGameScoringService);
  private readonly dialog = inject(MatDialog);

  /** `grid-template-columns`: sticky category column + one min-width column per player. */
  readonly gridColumns = computed(
    () => `auto repeat(${this.gameService.scores().length}, minmax(4.5rem, 1fr))`,
  );

  /** Category id → name, for resolving rule references in the info popup. */
  private readonly categoryNames = computed<CategoryNames>(() => {
    const config = this.gameService.config();
    return new Map(config?.categories.map((c) => [c.id, c.name]) ?? []);
  });

  /** Prompt for a category value (pre-filled with the current one) and store it. */
  editValue(player: Player, category: ScoringCategory, current: number): void {
    const data: NumberDialogData = {
      title: `${player.name} — ${category.name}`,
      playerColor: player.color,
      value: current,
    };
    this.dialog
      .open(NumberDialogComponent, { data })
      .afterClosed()
      .subscribe((value) => {
        if (value != null) {
          this.gameService.setValue(player, category.id, value);
        }
      });
  }

  /** Explain a category: full name, description, and how its rule scores. */
  showInfo(category: ScoringCategory): void {
    const data: CategoryInfoDialogData = { category, categoryNames: this.categoryNames() };
    this.dialog.open(CategoryInfoDialogComponent, { data });
  }

  newGame(): void {
    const data: ConfirmDialogData = {
      title: 'New Game',
      message: 'Discard the current game and start over?',
      confirmLabel: 'New Game',
    };
    this.dialog
      .open(ConfirmDialogComponent, { data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.gameService.reset();
        }
      });
  }
}
