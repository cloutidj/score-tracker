import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ScoringConfigStore } from '../scoring-config.store';
import { ScoringConfig, ScoringCategory } from '../models/scoring-config';
import { ScoringRule, ScoringRuleKind } from '../models/scoring-rule';

/** Open with an existing config to edit it, or `null` to build a new one. */
export interface ScoringConfigBuilderData {
  config: ScoringConfig | null;
}

interface DraftConfig {
  id: string;
  name: string;
  categories: ScoringCategory[];
}

interface RuleKindOption {
  value: ScoringRuleKind;
  label: string;
}

/** A fresh rule of the given kind, with sensible defaults for its params. */
function defaultRule(kind: ScoringRuleKind): ScoringRule {
  switch (kind) {
    case 'flat':
      return { kind: 'flat' };
    case 'perUnit':
      return { kind: 'perUnit', pointsPerUnit: 1 };
    case 'lookupTable':
      return { kind: 'lookupTable', mode: 'threshold', table: [] };
    case 'multiplyCategory':
      return { kind: 'multiplyCategory', categoryId: '' };
    case 'aggregateMultiply':
      return { kind: 'aggregateMultiply', aggregate: 'sum', categoryIds: [] };
  }
}

/**
 * Create/edit dialog for a user {@link ScoringConfig}: name it, add categories, and pick each
 * category's rule from the fixed catalog, filling in that kind's params (per-unit points, a
 * lookup table, or category references). The draft is held in one signal and updated
 * immutably, which keeps it reactive under the app's zoneless change detection without a
 * deeply dynamic reactive-forms `FormArray`. Saving delegates to {@link ScoringConfigStore}
 * (which assigns the id for a new config); the select list re-renders off the store's signal.
 */
@Component({
  selector: 'st-scoring-config-builder',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FontAwesomeModule,
  ],
  templateUrl: './scoring-config-builder.component.html',
  styleUrl: './scoring-config-builder.component.scss',
})
export class ScoringConfigBuilderComponent {
  private readonly dialogRef = inject(MatDialogRef<ScoringConfigBuilderComponent>);
  private readonly store = inject(ScoringConfigStore);
  private readonly data = inject<ScoringConfigBuilderData>(MAT_DIALOG_DATA);

  protected readonly isEditing = !!this.data.config;

  protected readonly ruleKinds: RuleKindOption[] = [
    { value: 'flat', label: 'Flat (value is the points)' },
    { value: 'perUnit', label: 'Per unit (value × points)' },
    { value: 'lookupTable', label: 'Lookup table (value → points)' },
    { value: 'multiplyCategory', label: 'Multiply by another category' },
    { value: 'aggregateMultiply', label: 'Multiply by min/max/sum of categories' },
  ];

  protected readonly aggregates: ('min' | 'max' | 'sum')[] = ['min', 'max', 'sum'];

  protected readonly draft = signal<DraftConfig>(this.seed());

  /** Save is allowed once the config is named and every category has a name. */
  protected readonly canSave = computed(() => {
    const draft = this.draft();
    return (
      draft.name.trim().length > 0 &&
      draft.categories.length > 0 &&
      draft.categories.every((category) => category.name.trim().length > 0)
    );
  });

  /** Other categories (by id) a rule on category `index` may reference. */
  otherCategories(index: number): ScoringCategory[] {
    return this.draft().categories.filter((_, i) => i !== index);
  }

  /** Categories an aggregate may reference: any other non-aggregate category (no chains). */
  aggregateOptions(index: number): ScoringCategory[] {
    return this.otherCategories(index).filter((category) => category.rule.kind !== 'aggregateMultiply');
  }

  setName(event: Event): void {
    const name = (event.target as HTMLInputElement).value;
    this.patch((draft) => (draft.name = name));
  }

  addCategory(): void {
    this.patch((draft) =>
      draft.categories.push({ id: crypto.randomUUID(), name: '', rule: { kind: 'flat' } }),
    );
  }

  removeCategory(index: number): void {
    this.patch((draft) => draft.categories.splice(index, 1));
  }

  setCategoryName(index: number, event: Event): void {
    const name = (event.target as HTMLInputElement).value;
    this.patchCategory(index, (category) => (category.name = name));
  }

  setKind(index: number, kind: ScoringRuleKind): void {
    this.patchCategory(index, (category) => (category.rule = defaultRule(kind)));
  }

  setPointsPerUnit(index: number, event: Event): void {
    const value = this.numberFrom(event);
    this.patchCategory(index, (category) => {
      if (category.rule.kind === 'perUnit') {
        category.rule.pointsPerUnit = value;
      } else if (category.rule.kind === 'multiplyCategory') {
        category.rule.pointsPerUnit = value;
      }
    });
  }

  setMultiplyCategory(index: number, categoryId: string): void {
    this.patchCategory(index, (category) => {
      if (category.rule.kind === 'multiplyCategory') {
        category.rule.categoryId = categoryId;
      }
    });
  }

  setAggregate(index: number, aggregate: 'min' | 'max' | 'sum'): void {
    this.patchCategory(index, (category) => {
      if (category.rule.kind === 'aggregateMultiply') {
        category.rule.aggregate = aggregate;
      }
    });
  }

  setAggregateCategories(index: number, categoryIds: string[]): void {
    this.patchCategory(index, (category) => {
      if (category.rule.kind === 'aggregateMultiply') {
        category.rule.categoryIds = categoryIds;
      }
    });
  }

  setLookupMode(index: number, mode: 'threshold' | 'exact'): void {
    this.patchCategory(index, (category) => {
      if (category.rule.kind === 'lookupTable') {
        category.rule.mode = mode;
      }
    });
  }

  addLookupRow(index: number): void {
    this.patchCategory(index, (category) => {
      if (category.rule.kind === 'lookupTable') {
        category.rule.table.push({ at: 0, points: 0 });
      }
    });
  }

  removeLookupRow(index: number, row: number): void {
    this.patchCategory(index, (category) => {
      if (category.rule.kind === 'lookupTable') {
        category.rule.table.splice(row, 1);
      }
    });
  }

  setLookupAt(index: number, row: number, event: Event): void {
    const value = this.numberFrom(event);
    this.patchCategory(index, (category) => {
      if (category.rule.kind === 'lookupTable') {
        category.rule.table[row].at = value;
      }
    });
  }

  setLookupPoints(index: number, row: number, event: Event): void {
    const value = this.numberFrom(event);
    this.patchCategory(index, (category) => {
      if (category.rule.kind === 'lookupTable') {
        category.rule.table[row].points = value;
      }
    });
  }

  save(): void {
    if (!this.canSave()) {
      return;
    }
    const draft = this.draft();
    const config: ScoringConfig = {
      id: draft.id,
      name: draft.name.trim(),
      builtIn: false,
      categories: draft.categories.map((category) => ({
        ...category,
        name: category.name.trim(),
      })),
    };
    this.store.save(config);
    this.dialogRef.close();
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private seed(): DraftConfig {
    const source = this.data.config;
    if (source) {
      return structuredClone({ id: source.id, name: source.name, categories: source.categories });
    }
    return { id: '', name: '', categories: [] };
  }

  private numberFrom(event: Event): number {
    const value = Number((event.target as HTMLInputElement).value);
    return Number.isFinite(value) ? value : 0;
  }

  private patch(mutator: (draft: DraftConfig) => void): void {
    this.draft.update((draft) => {
      const next = structuredClone(draft);
      mutator(next);
      return next;
    });
  }

  private patchCategory(index: number, mutator: (category: ScoringCategory) => void): void {
    this.patch((draft) => mutator(draft.categories[index]));
  }
}
