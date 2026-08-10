/**
 * Shared index-list editing rules for the "ordered entries with edit/remove by position"
 * models ({@link import('../../free-form-scoring/models/free-form-player-scores').FreeFormPlayerScores},
 * {@link import('../../health-points/models/health-points-player-state').HealthPointsPlayerState}):
 * both are otherwise-unrelated value objects that happen to share this one piece of index
 * arithmetic, so it's factored out rather than duplicated.
 */
export class EntryListHelper {
  /** Replace the value at `index` (no-op if out of range). */
  static edit<T>(entries: readonly T[], index: number, value: T): readonly T[] {
    return entries.map((existing, i) => (i === index ? value : existing));
  }

  /** Drop the entry at `index` entirely (no-op if out of range). */
  static remove<T>(entries: readonly T[], index: number): readonly T[] {
    return entries.filter((_, i) => i !== index);
  }
}
