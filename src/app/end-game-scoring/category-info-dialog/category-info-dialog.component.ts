import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CategoryNames, describeRule } from '../describe-rule';
import { ScoringCategory } from '../models/scoring-config';

export interface CategoryInfoDialogData {
  category: ScoringCategory;
  /** Category id → name, so rule references resolve to readable names. */
  categoryNames: CategoryNames;
}

/**
 * Read-only popup explaining one grid category: its full name, the "what to enter" help text,
 * and a plain-English "how it scores" line from the pure {@link describeRule} helper. Opened by
 * the info button on each scoresheet row; closes itself with no result.
 */
@Component({
  selector: 'st-category-info-dialog',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './category-info-dialog.component.html',
})
export class CategoryInfoDialogComponent {
  readonly data = inject<CategoryInfoDialogData>(MAT_DIALOG_DATA);

  readonly ruleText = describeRule(this.data.category.rule, this.data.categoryNames);
}
