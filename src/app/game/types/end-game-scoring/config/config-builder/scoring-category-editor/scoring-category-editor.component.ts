import { Component, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { IconButtonComponent } from '@ui/button/icon-button.component';
import { FormFieldComponent } from '@ui/form-field/form-field.component';
import { SelectComponent, SelectOption } from '@ui/select/select.component';
import { ScoringRuleKind } from '@game-types/end-game-scoring/scoring/scoring-rule';
import { ruleHandler, ruleHandlers } from '@game-types/end-game-scoring/scoring/rule-registry';
import { DraftCategory } from '../draft-category';
import { PerUnitRuleFieldsComponent } from './per-unit-rule-fields.component';
import { MultiplyCategoryRuleFieldsComponent } from './multiply-category-rule-fields.component';
import { AggregateMultiplyRuleFieldsComponent } from './aggregate-multiply-rule-fields.component';
import { LookupTableRuleFieldsComponent } from './lookup-table-rule-fields.component';

/**
 * Editor for one {@link DraftCategory}: its name/shortName/description, the rule-kind picker,
 * and — via a `*-rule-fields` child chosen by `cat.rule.kind` — that kind's own params. Plain
 * text/number edits go through `[formField]` on `categoryField`; edits that reshape the
 * category (switching rule kind, a lookup row, an aggregate toggle) go through `mutate`
 * instead, since they replace part of the value rather than setting one field. Each child
 * re-emits its own `mutate` straight through to this component's, unchanged.
 */
@Component({
  selector: 'st-scoring-category-editor',
  imports: [
    FormField,
    NgIcon,
    IconButtonComponent,
    FormFieldComponent,
    SelectComponent,
    PerUnitRuleFieldsComponent,
    MultiplyCategoryRuleFieldsComponent,
    AggregateMultiplyRuleFieldsComponent,
    LookupTableRuleFieldsComponent,
  ],
  templateUrl: './scoring-category-editor.component.html',
  styleUrl: './scoring-category-editor.component.scss',
})
export class ScoringCategoryEditorComponent {
  /** This category's current value, read-only (structural edits go through `mutate`). */
  readonly category = input.required<DraftCategory>();
  /** This category's field slice, for `[formField]`-bound plain text/number edits. */
  readonly categoryField = input.required<FieldTree<DraftCategory>>();
  /** Every category in the config, for cross-reference selects (multiply-by / aggregate-of). */
  readonly allCategories = input.required<DraftCategory[]>();

  /** Apply a structural change (rule-kind switch, lookup row, aggregate toggle) to this category. */
  readonly mutate = output<(category: DraftCategory) => void>();
  readonly remove = output<void>();

  /** Display order of the rule catalog; labels come from each kind's handler. */
  private readonly ruleKindOrder: ScoringRuleKind[] = [
    'flat',
    'perUnit',
    'lookupTable',
    'multiplyCategory',
    'aggregateMultiply',
  ];

  protected readonly ruleKindOptions: SelectOption<ScoringRuleKind>[] = this.ruleKindOrder.map((value) => ({
    value,
    label: ruleHandlers[value].label,
  }));

  setKind(kind: ScoringRuleKind | null): void {
    if (!kind) return;
    this.mutate.emit((category) => (category.rule = ruleHandler(kind).defaultRule()));
  }
}
