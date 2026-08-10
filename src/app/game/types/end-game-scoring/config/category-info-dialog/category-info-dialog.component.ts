import { Component, inject } from '@angular/core';
import { ScoringRule } from '../../scoring/scoring-rule';
import { ruleHandler } from '../../scoring/rule-registry';
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
 * and a plain-English "how it scores" line from the pure {@link CategoryInfoDialogComponent.describeRule}
 * helper. Opened by the info button on each scoresheet row; closes itself with no result.
 */
@Component({
  selector: 'st-category-info-dialog',
  imports: [ButtonComponent],
  templateUrl: './category-info-dialog.component.html',
})
export class CategoryInfoDialogComponent {
  private readonly dialogRef = inject(DIALOG_REF) as DialogRef<void>;

  readonly data = inject(DIALOG_DATA) as CategoryInfoDialogData;

  readonly ruleText = CategoryInfoDialogComponent.describeRule(
    this.data.category.rule,
    this.data.categoryNames,
  );

  close(): void {
    this.dialogRef.close();
  }

  /**
   * Human-readable "how does this category score?" text for a single rule, with any category
   * references resolved to names via `categoryNames`. Delegates to the rule's handler in
   * `rules/<kind>.ts`.
   */
  private static describeRule(rule: ScoringRule, categoryNames: CategoryNames): string {
    return ruleHandler(rule.kind).describe(rule, categoryNames);
  }
}
