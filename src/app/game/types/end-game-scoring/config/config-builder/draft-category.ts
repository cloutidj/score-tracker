import { ScoringCategory } from '@game-types/end-game-scoring/_shared/models/scoring-category';
import { ScoringRule } from '@game-types/end-game-scoring/scoring/scoring-rule';

/**
 * Editing shape of a {@link ScoringCategory}: the optional `shortName`/`description` are kept
 * as required (seeded `''`) strings so every `[formField]` input binds a field that's always
 * materialized. The builder's `save()` trims them back to `undefined` before persisting.
 */
export interface DraftCategory {
  id: string;
  name: string;
  shortName: string;
  description: string;
  rule: ScoringRule;
}

/**
 * Lift a persisted {@link ScoringCategory} into editable {@link DraftCategory} form: optional
 * text becomes `''`, and a `multiplyCategory` rule's optional `pointsPerUnit` is seeded to `1`,
 * so every `[formField]`-bound field exists (and so materializes) before editing.
 */
export function toDraftCategory(category: ScoringCategory): DraftCategory {
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
