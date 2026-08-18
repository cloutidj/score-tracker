import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { FormFieldComponent } from '@ui/form-field/form-field.component';
import { PerUnitRule } from '@game-types/end-game-scoring/scoring/rules/per-unit-rule';
import { DraftCategory } from '../draft-category';

/** `perUnit` rule's own field: points scored per unit of the entered value. */
@Component({
  selector: 'st-per-unit-rule-fields',
  imports: [FormField, FormFieldComponent],
  template: `
    <st-form-field label="Points per unit" class="st-full-width">
      <input type="number" [formField]="ruleField().pointsPerUnit" />
    </st-form-field>
  `,
})
export class PerUnitRuleFieldsComponent {
  readonly categoryField = input.required<FieldTree<DraftCategory>>();

  protected ruleField(): FieldTree<PerUnitRule> {
    return this.categoryField().rule as unknown as FieldTree<PerUnitRule>;
  }
}
