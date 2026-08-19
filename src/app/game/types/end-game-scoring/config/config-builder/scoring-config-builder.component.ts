import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { FormField, applyEach, form, validate } from '@angular/forms/signals';
import { ButtonComponent } from '@ui/button/button.component';
import { FormFieldComponent } from '@ui/form-field/form-field.component';
import { DialogRef } from '@ui/dialog/dialog-ref';
import { DIALOG_DATA, DIALOG_REF } from '@ui/dialog/dialog.tokens';
import { ScoringConfigStore } from '../scoring-config.store';
import { ScoringConfig } from '@game-types/end-game-scoring/_shared/models/scoring-config';
import { DraftCategory, toDraftCategory } from './draft-category';
import { ScoringCategoryEditorComponent } from './scoring-category-editor/scoring-category-editor.component';

/** Open with an existing config to edit it, or `null` to build a new one. */
export interface ScoringConfigBuilderData {
  config: ScoringConfig | null;
}

interface DraftConfig {
  id: string;
  name: string;
  categories: DraftCategory[];
}

/** Trim a value, returning `undefined` when it's empty so blanks don't persist as `''`. */
function blankToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Create/edit dialog for a user {@link ScoringConfig}: name it, add categories, and hand each
 * category to {@link ScoringCategoryEditorComponent} for its own rule/params editing. A Signal
 * Forms `form()` over the `draft` signal binds the name/category-name text via `[formField]`
 * and drives the Save button off its own validity. Adding/removing a category, and a category
 * editor's own structural edits (relayed up via its `mutate` output), update the `draft` signal
 * directly. Saving delegates to {@link ScoringConfigStore} (which assigns the id for a new
 * config); the select list re-renders off the store's signal.
 */
@Component({
  selector: 'st-scoring-config-builder',
  imports: [FormField, NgIcon, ButtonComponent, FormFieldComponent, ScoringCategoryEditorComponent],
  templateUrl: './scoring-config-builder.component.html',
  styleUrl: './scoring-config-builder.component.scss',
})
export class ScoringConfigBuilderComponent {
  private readonly dialogRef = inject(DIALOG_REF) as DialogRef<ScoringConfig>;
  private readonly store = inject(ScoringConfigStore);
  private readonly data = inject(DIALOG_DATA) as ScoringConfigBuilderData;

  protected readonly isEditing = !!this.data.config;

  protected readonly draft = signal<DraftConfig>(this.seed());

  // Form over the draft signal: `[formField]` two-way binds the name fields, and required-name
  // rules (config + every category, plus a non-empty category list) make `valid()` the Save gate.
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

  /** Apply a category editor's structural edit (rule-kind switch, lookup row, aggregate toggle). */
  protected patchCategory(index: number, mutator: (category: DraftCategory) => void): void {
    this.patch((draft) => mutator(draft.categories[index]));
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
}
