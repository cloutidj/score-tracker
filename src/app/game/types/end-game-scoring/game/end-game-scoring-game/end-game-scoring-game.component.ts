import { Component, computed, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Player } from '@player/models/player';
import { ButtonComponent } from '@ui/button/button.component';
import { IconButtonComponent } from '@ui/button/icon-button.component';
import { NewGameConfirmService } from '@game-types/_shared/new-game-confirm.service';
import { DialogService } from '@ui/dialog/dialog.service';
import { NumberDialogService } from '@ui/number-entry/number-dialog/number-dialog.service';
import { ColorDirective } from '@color/color.directive';
import { NumberChangeDirective } from '@ui/number-entry/number-change/number-change.directive';
import {
  CategoryInfoDialogComponent,
  CategoryInfoDialogData,
} from '@game-types/end-game-scoring/config/category-info-dialog/category-info-dialog.component';
import { CategoryNames } from '@game-types/end-game-scoring/_shared/models/category-names';
import { EndGameScoringService } from '../end-game-scoring.service';
import { ScoringCategory } from '@game-types/end-game-scoring/_shared/models/scoring-category';

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
  imports: [NgIcon, ButtonComponent, IconButtonComponent, ColorDirective, NumberChangeDirective],
  templateUrl: './end-game-scoring-game.component.html',
  styleUrl: './end-game-scoring-game.component.scss',
})
export class EndGameScoringGameComponent {
  readonly gameService = inject(EndGameScoringService);
  private readonly dialog = inject(DialogService);
  private readonly confirm = inject(NewGameConfirmService);
  private readonly numberDialog = inject(NumberDialogService);

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
    this.numberDialog
      .prompt({ player, action: category.name, value: current })
      .subscribe((value) => this.gameService.setValue(player, category.id, value));
  }

  /** Explain a category: full name, description, and how its rule scores. */
  showInfo(category: ScoringCategory): void {
    const data: CategoryInfoDialogData = { category, categoryNames: this.categoryNames() };
    this.dialog.open(CategoryInfoDialogComponent, { data });
  }

  newGame(): void {
    this.confirm.newGame(() => this.gameService.reset());
  }
}
