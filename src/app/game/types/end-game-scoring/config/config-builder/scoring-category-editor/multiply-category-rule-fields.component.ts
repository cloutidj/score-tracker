import { Component, computed, input, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { FormFieldComponent } from '@ui/form-field/form-field.component';
import { SelectComponent, SelectOption } from '@ui/select/select.component';
import { MultiplyCategoryRule } from '@game-types/end-game-scoring/scoring/rules/multiply-category-rule';
import { DraftCategory } from '../draft-category';

/** `multiplyCategory` rule's own fields: which category to multiply by, and its points-per-unit factor. */
@Component({
  selector: 'st-multiply-category-rule-fields',
  imports: [FormField, FormFieldComponent, SelectComponent],
  template: `
    <st-form-field label="Multiply by category" class="st-full-width">
      <st-select [options]="otherCategoryOptions()" [value]="rule().categoryId" (valueChange)="setCategory($event)" />
    </st-form-field>
    <st-form-field label="Points per unit" class="st-full-width">
      <input type="number" [formField]="ruleField().pointsPerUnit" />
    </st-form-field>
  `,
})
export class MultiplyCategoryRuleFieldsComponent {
  readonly category = input.required<DraftCategory>();
  readonly categoryField = input.required<FieldTree<DraftCategory>>();
  readonly allCategories = input.required<DraftCategory[]>();

  readonly mutate = output<(category: DraftCategory) => void>();

  protected rule(): MultiplyCategoryRule {
    return this.category().rule as MultiplyCategoryRule;
  }

  protected ruleField(): FieldTree<MultiplyCategoryRule & { pointsPerUnit: number }> {
    return this.categoryField().rule as unknown as FieldTree<MultiplyCategoryRule & { pointsPerUnit: number }>;
  }

  /** Every other category, as `st-select` options. */
  protected readonly otherCategoryOptions = computed<SelectOption<string>[]>(() =>
    this.allCategories()
      .filter((c) => c.id !== this.category().id)
      .map((other) => ({ value: other.id, label: other.name || '(unnamed)' })),
  );

  setCategory(categoryId: string | null): void {
    if (!categoryId) return;
    this.mutate.emit((category) => {
      if (category.rule.kind === 'multiplyCategory') {
        category.rule.categoryId = categoryId;
      }
    });
  }
}
