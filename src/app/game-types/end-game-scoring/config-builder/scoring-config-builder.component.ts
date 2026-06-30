import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FieldTree, FormField, applyEach, form, validate } from '@angular/forms/signals';
import { ScoringConfigStore } from '../scoring-config.store';
import { ScoringConfig, ScoringCategory } from '../models/scoring-config';
import {
  ScoringRule,
  ScoringRuleKind,
  PerUnitRule,
  MultiplyCategoryRule,
  LookupTableRule,
} from '../models/scoring-rule';

/** Open with an existing config to edit it, or `null` to build a new one. */
export interface ScoringConfigBuilderData {
  config: ScoringConfig | null;
}

/**
 * Editing shape of a {@link ScoringCategory}: the optional `shortName`/`description` are kept
 * as required (seeded `''`) strings so every `[formField]` input binds a field that's always
 * materialized. `save()` trims them back to `undefined` via {@link blankToUndefined}.
 */
interface DraftCategory {
  id: string;
  name: string;
  shortName: string;
  description: string;
  rule: ScoringRule;
}

interface DraftConfig {
  id: string;
  name: string;
  categories: DraftCategory[];
}

interface RuleKindOption {
  value: ScoringRuleKind;
  label: string;
}

/** Trim a value, returning `undefined` when it's empty so blanks don't persist as `''`. */
function blankToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
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
      return { kind: 'multiplyCategory', categoryId: '', pointsPerUnit: 1 };
    case 'aggregateMultiply':
      return { kind: 'aggregateMultiply', aggregate: 'sum', categoryIds: [] };
  }
}

/**
 * Lift a persisted {@link ScoringCategory} into editable {@link DraftCategory} form: optional
 * text becomes `''`, and a `multiplyCategory` rule's optional `pointsPerUnit` is seeded to `1`,
 * so every `[formField]`-bound field exists (and so materializes) before editing.
 */
function toDraftCategory(category: ScoringCategory): DraftCategory {
  return {
    id: category.id,
    name: category.name,
    shortName: category.shortName ?? '',
    description: category.description ?? '',
    rule:
      category.rule.kind === 'multiplyCategory'
        ? { ...category.rule, pointsPerUnit: category.rule.pointsPerUnit ?? 1 }
        : category.rule,
  };
}

/**
 * Create/edit dialog for a user {@link ScoringConfig}: name it, add categories, and pick each
 * category's rule from the fixed catalog, filling in that kind's params (per-unit points, a
 * lookup table, or category references). A Signal Forms `form()` over the `draft` signal binds
 * every text/number input via `[formField]` and drives the Save button off its own validity.
 * Structural changes that aren't plain field edits — adding/removing categories or lookup rows,
 * and switching a category's rule kind (which reshapes its params) — update the `draft` signal
 * directly. Saving delegates to {@link ScoringConfigStore} (which assigns the id for a new
 * config); the select list re-renders off the store's signal.
 */
@Component({
  selector: 'st-scoring-config-builder',
  imports: [
    FormField,
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

  // Form over the draft signal: `[formField]` two-way binds each input, and required-name rules
  // (config + every category, plus a non-empty category list) make `valid()` the Save gate.
  protected readonly configForm = form(this.draft, (cfg) => {
    validate(cfg.name, ({ value }) =>
      value().trim().length === 0 ? { kind: 'required' } : undefined,
    );
    validate(cfg.categories, ({ value }) =>
      value().length === 0 ? { kind: 'empty' } : undefined,
    );
    applyEach(cfg.categories, (category) => {
      validate(category.name, ({ value }) =>
        value().trim().length === 0 ? { kind: 'required' } : undefined,
      );
    });
  });

  /** Save is allowed once the config is named and every category has a name. */
  protected readonly canSave = computed(() => this.configForm().valid());

  // A category's `rule` field is a discriminated union, so its tree only exposes the shared
  // `kind`. Inside a `@if` that has pinned the kind, narrow to the active member to reach its
  // params for `[formField]`; the proxy resolves them against the current (matching) value.
  protected perUnitRule(index: number): FieldTree<PerUnitRule> {
    return this.configForm.categories[index].rule as unknown as FieldTree<PerUnitRule>;
  }

  protected multiplyRule(index: number): FieldTree<MultiplyCategoryRule & { pointsPerUnit: number }> {
    return this.configForm.categories[index].rule as unknown as FieldTree<
      MultiplyCategoryRule & { pointsPerUnit: number }
    >;
  }

  protected lookupRule(index: number): FieldTree<LookupTableRule> {
    return this.configForm.categories[index].rule as unknown as FieldTree<LookupTableRule>;
  }

  /** Other categories (by id) a rule on category `index` may reference. */
  otherCategories(index: number): DraftCategory[] {
    return this.draft().categories.filter((_, i) => i !== index);
  }

  /** Categories an aggregate may reference: any other non-aggregate category (no chains). */
  aggregateOptions(index: number): DraftCategory[] {
    return this.otherCategories(index).filter((category) => category.rule.kind !== 'aggregateMultiply');
  }

  addCategory(): void {
    this.patch((draft) =>
      draft.categories.push({
        id: crypto.randomUUID(),
        name: '',
        shortName: '',
        description: '',
        rule: { kind: 'flat' },
      }),
    );
  }

  removeCategory(index: number): void {
    this.patch((draft) => draft.categories.splice(index, 1));
  }

  setKind(index: number, kind: ScoringRuleKind): void {
    this.patchCategory(index, (category) => (category.rule = defaultRule(kind)));
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
        shortName: blankToUndefined(category.shortName),
        description: blankToUndefined(category.description),
      })),
    };
    const stored = this.store.save(config);
    this.dialogRef.close(stored);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private seed(): DraftConfig {
    const source = this.data.config;
    if (source) {
      const clone = structuredClone(source);
      return { id: clone.id, name: clone.name, categories: clone.categories.map(toDraftCategory) };
    }
    return { id: '', name: '', categories: [] };
  }

  private patch(mutator: (draft: DraftConfig) => void): void {
    this.draft.update((draft) => {
      const next = structuredClone(draft);
      mutator(next);
      return next;
    });
  }

  private patchCategory(index: number, mutator: (category: DraftCategory) => void): void {
    this.patch((draft) => mutator(draft.categories[index]));
  }
}
