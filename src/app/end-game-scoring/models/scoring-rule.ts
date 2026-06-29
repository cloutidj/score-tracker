/**
 * The fixed catalog of ways one category contributes to a player's final score. A
 * discriminated union on `kind`: the pure scoring engine (see `scoring-engine.ts`) switches
 * on it to turn a player's entered value for a category into points.
 *
 * Deliberately a closed set of rule kinds rather than a general formula engine — it covers
 * the common board-game mechanisms (flat totals, per-unit multipliers, count→points tables,
 * cross-category multipliers) while staying bounded and serializable. Adding a kind means
 * extending this union, the engine, and one builder sub-form — nothing in the core.
 */
export type ScoringRule =
  | FlatRule
  | PerUnitRule
  | LookupTableRule
  | MultiplyCategoryRule
  | AggregateMultiplyRule;

export type ScoringRuleKind = ScoringRule['kind'];

/** The entered value *is* the points (e.g. Terraform Rating, card VP, a hand-summed total). */
export interface FlatRule {
  kind: 'flat';
}

/** points = value × pointsPerUnit (e.g. 1 VP per greenery tile, 5 VP per milestone). */
export interface PerUnitRule {
  kind: 'perUnit';
  pointsPerUnit: number;
}

/**
 * points = a table lookup of the entered value. `threshold` mode picks the points of the
 * highest `at` not exceeding the value (a step/track, e.g. a "That's So Clever" green track);
 * `exact` mode matches `at === value` (0 if none, e.g. a blue-box count→points table). The
 * table need not be pre-sorted.
 */
export interface LookupTableRule {
  kind: 'lookupTable';
  mode: 'threshold' | 'exact';
  table: LookupEntry[];
}

export interface LookupEntry {
  at: number;
  points: number;
}

/**
 * points = value × the referenced category's *entered value* (× optional `pointsPerUnit`,
 * default 1). For "this many of that" scoring across two entered categories.
 */
export interface MultiplyCategoryRule {
  kind: 'multiplyCategory';
  categoryId: string;
  pointsPerUnit?: number;
}

/**
 * points = value × an aggregate of the referenced categories' *computed points*. Models
 * bonuses that scale with other scores — e.g. "That's So Clever" foxes, each worth the
 * player's lowest color score. Referencing another `aggregateMultiply` is unsupported (that
 * reference contributes 0); the builder prevents authoring it.
 */
export interface AggregateMultiplyRule {
  kind: 'aggregateMultiply';
  aggregate: 'min' | 'max' | 'sum';
  categoryIds: string[];
}
