import { Component, computed, input, output } from '@angular/core';
import { FormFieldComponent } from '@ui/form-field/form-field.component';
import { SelectComponent, SelectOption } from '@ui/select/select.component';
import { AggregateMultiplyRule } from '@game-types/end-game-scoring/scoring/rules/aggregate-multiply-rule';
import { DraftCategory } from '../draft-category';

type AggregateKind = AggregateMultiplyRule['aggregate'];

/** `aggregateMultiply` rule's own fields: the aggregate function and which categories feed it. */
@Component({
  selector: 'st-aggregate-multiply-rule-fields',
  imports: [FormFieldComponent, SelectComponent],
  template: `
    <st-form-field label="Aggregate" st-layout="full-width">
      <st-select [options]="aggregateKindOptions" [value]="rule().aggregate" (valueChange)="setAggregate($event)" />
    </st-form-field>
    <fieldset class="st-field" st-layout="vertical gap:xs">
      <legend class="st-field-label">Of categories</legend>
      @for (other of aggregateOptions(); track other.id) {
        <label st-layout="horizontal align:center gap:xs">
          <input
            type="checkbox"
            [checked]="rule().categoryIds.includes(other.id)"
            (change)="toggleCategory(other.id, $event)"
          />{{ other.name || '(unnamed)' }}
        </label>
      }
    </fieldset>
  `,
  styles: `
    // <fieldset> reuses .st-field/.st-field-label (via <legend>) for label styling; reset its
    // native border/margin/padding to match the layout other .st-field elements get for free.
    fieldset.st-field {
      border: none;
      margin: 0;
      padding: 0;
    }
  `,
})
export class AggregateMultiplyRuleFieldsComponent {
  readonly category = input.required<DraftCategory>();
  readonly allCategories = input.required<DraftCategory[]>();

  readonly mutate = output<(category: DraftCategory) => void>();

  protected readonly aggregateKindOptions: SelectOption<AggregateKind>[] = [
    { value: 'min', label: 'min' },
    { value: 'max', label: 'max' },
    { value: 'sum', label: 'sum' },
  ];

  protected rule(): AggregateMultiplyRule {
    return this.category().rule as AggregateMultiplyRule;
  }

  /** Categories this aggregate may reference: any other non-aggregate category (no chains). */
  protected readonly aggregateOptions = computed(() =>
    this.allCategories().filter((c) => c.id !== this.category().id && c.rule.kind !== 'aggregateMultiply'),
  );

  setAggregate(aggregate: AggregateKind | null): void {
    if (!aggregate) return;
    this.mutate.emit((category) => {
      if (category.rule.kind === 'aggregateMultiply') {
        category.rule.aggregate = aggregate;
      }
    });
  }

  toggleCategory(categoryId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.mutate.emit((category) => {
      if (category.rule.kind === 'aggregateMultiply') {
        category.rule.categoryIds = checked
          ? [...category.rule.categoryIds, categoryId]
          : category.rule.categoryIds.filter((id) => id !== categoryId);
      }
    });
  }
}
