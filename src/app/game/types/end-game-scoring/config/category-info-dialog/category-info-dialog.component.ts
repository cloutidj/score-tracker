import { Component, inject } from '@angular/core';
import { describeRule } from '../../scoring/describe-rule';
import { CategoryNames } from '../../_shared/models/category-names';
import { ScoringCategory } from '../../_shared/models/scoring-category';
import { ButtonComponent } from '@ui/button/button.component';
import { DialogRef } from '@ui/dialog/dialog-ref';
import { DIALOG_DATA, DIALOG_REF } from '@ui/dialog/dialog.tokens';

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
  imports: [ButtonComponent],
  templateUrl: './category-info-dialog.component.html',
})
export class CategoryInfoDialogComponent {
  private readonly dialogRef = inject(DIALOG_REF) as DialogRef<void>;

  readonly data = inject(DIALOG_DATA) as CategoryInfoDialogData;

  readonly ruleText = describeRule(this.data.category.rule, this.data.categoryNames);

  close(): void {
    this.dialogRef.close();
  }
}
