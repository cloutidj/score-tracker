import { Component, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { ButtonComponent } from '@ui/button/button.component';
import { IconButtonComponent } from '@ui/button/icon-button.component';
import { FormFieldComponent } from '@ui/form-field/form-field.component';
import { SelectComponent, SelectOption } from '@ui/select/select.component';
import { LookupTableRule } from '@game-types/end-game-scoring/scoring/rules/lookup-table-rule';
import { DraftCategory } from '../draft-category';

type LookupMode = LookupTableRule['mode'];

/** `lookupTable` rule's own fields: threshold/exact mode, and its value→points rows. */
@Component({
  selector: 'st-lookup-table-rule-fields',
  imports: [FormField, NgIcon, ButtonComponent, IconButtonComponent, FormFieldComponent, SelectComponent],
  template: `
    <st-form-field label="Lookup mode" class="st-full-width">
      <st-select [options]="lookupModeOptions" [value]="rule().mode" (valueChange)="setMode($event)" />
    </st-form-field>
    <div class="lookup-table">
      @for (entry of rule().table; track $index; let r = $index) {
        <div class="lookup-row">
          <st-form-field label="At" class="lookup-cell">
            <input type="number" [formField]="ruleField().table[r].at" />
          </st-form-field>
          <st-form-field label="Points" class="lookup-cell">
            <input type="number" [formField]="ruleField().table[r].points" />
          </st-form-field>
          <button stIconButton status="muted" type="button" aria-label="Remove row" (click)="removeRow(r)">
            <ng-icon name="phosphorX"></ng-icon>
          </button>
        </div>
      }
      <button stButton type="button" (click)="addRow()">
        <ng-icon name="phosphorPlus"></ng-icon>
        Add row
      </button>
    </div>
  `,
  styles: `
    .lookup-table {
      display: flex;
      flex-direction: column;
      gap: var(--st-space-xs);
    }

    // A value→points pair plus a remove button, sized so two compact number fields fit a phone.
    .lookup-row {
      display: flex;
      align-items: center;
      gap: var(--st-space-xs);
    }

    .lookup-cell {
      flex: 1;
      min-width: 0;
    }
  `,
})
export class LookupTableRuleFieldsComponent {
  readonly category = input.required<DraftCategory>();
  readonly categoryField = input.required<FieldTree<DraftCategory>>();

  readonly mutate = output<(category: DraftCategory) => void>();

  protected readonly lookupModeOptions: SelectOption<LookupMode>[] = [
    { value: 'threshold', label: 'Threshold (highest at ≤ value)' },
    { value: 'exact', label: 'Exact (value matches at)' },
  ];

  protected rule(): LookupTableRule {
    return this.category().rule as LookupTableRule;
  }

  protected ruleField(): FieldTree<LookupTableRule> {
    return this.categoryField().rule as unknown as FieldTree<LookupTableRule>;
  }

  setMode(mode: LookupMode | null): void {
    if (!mode) return;
    this.mutate.emit((category) => {
      if (category.rule.kind === 'lookupTable') {
        category.rule.mode = mode;
      }
    });
  }

  addRow(): void {
    this.mutate.emit((category) => {
      if (category.rule.kind === 'lookupTable') {
        category.rule.table.push({ at: 0, points: 0 });
      }
    });
  }

  removeRow(row: number): void {
    this.mutate.emit((category) => {
      if (category.rule.kind === 'lookupTable') {
        category.rule.table.splice(row, 1);
      }
    });
  }
}
