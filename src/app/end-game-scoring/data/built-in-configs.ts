import { ScoringConfig } from '../models/scoring-config';

/**
 * Code-provided starting configs, registered via `BUILT_IN_SCORING_CONFIG` in `app.config.ts`
 * and merged with the user's saved configs by {@link import('../scoring-config.store').ScoringConfigStore}.
 * Between them they exercise every rule kind in the catalog, which is the point: they're the
 * working proof the engine covers real games, not just toy cases. Lookup-table point values
 * are sensible starting defaults the user can tweak via the in-app builder.
 */

/**
 * Terraforming Mars — mostly flat tallies plus a couple of per-unit multipliers. Tile/city
 * VP that depend on board adjacency are entered as a hand-counted total (`flat`).
 */
export const terraformingMarsConfig: ScoringConfig = {
  id: 'built-in:terraforming-mars',
  name: 'Terraforming Mars',
  builtIn: true,
  categories: [
    { id: 'tr', name: 'Terraform Rating', rule: { kind: 'flat' } },
    { id: 'milestones', name: 'Milestones (count)', rule: { kind: 'perUnit', pointsPerUnit: 5 } },
    { id: 'awards', name: 'Awards (points)', rule: { kind: 'flat' } },
    { id: 'greeneries', name: 'Greenery tiles', rule: { kind: 'perUnit', pointsPerUnit: 1 } },
    { id: 'cities', name: 'City tile points', rule: { kind: 'flat' } },
    { id: 'cards', name: 'Card victory points', rule: { kind: 'flat' } },
  ],
};

/**
 * That's So Clever — the catalog-stretcher: blue scores from a count→points table (`exact`),
 * green from a track position (`threshold`), and the foxes are each worth the player's lowest
 * color score (`aggregateMultiply` with `min` over the five colors).
 */
export const thatsSoCleverConfig: ScoringConfig = {
  id: 'built-in:thats-so-clever',
  name: "That's So Clever",
  builtIn: true,
  categories: [
    { id: 'yellow', name: 'Yellow', rule: { kind: 'flat' } },
    {
      id: 'blue',
      name: 'Blue (boxes crossed)',
      rule: {
        kind: 'lookupTable',
        mode: 'exact',
        table: [
          { at: 1, points: 1 },
          { at: 2, points: 2 },
          { at: 3, points: 4 },
          { at: 4, points: 7 },
          { at: 5, points: 11 },
          { at: 6, points: 16 },
          { at: 7, points: 22 },
          { at: 8, points: 29 },
          { at: 9, points: 37 },
          { at: 10, points: 46 },
          { at: 11, points: 56 },
          { at: 12, points: 67 },
        ],
      },
    },
    {
      id: 'green',
      name: 'Green (track position)',
      rule: {
        kind: 'lookupTable',
        mode: 'threshold',
        table: [
          { at: 1, points: 1 },
          { at: 2, points: 2 },
          { at: 3, points: 3 },
          { at: 4, points: 5 },
          { at: 5, points: 7 },
          { at: 6, points: 9 },
          { at: 7, points: 11 },
          { at: 8, points: 13 },
          { at: 9, points: 16 },
          { at: 10, points: 19 },
          { at: 11, points: 22 },
        ],
      },
    },
    { id: 'orange', name: 'Orange (sum)', rule: { kind: 'flat' } },
    { id: 'purple', name: 'Purple (sum)', rule: { kind: 'flat' } },
    {
      id: 'foxes',
      name: 'Foxes',
      rule: {
        kind: 'aggregateMultiply',
        aggregate: 'min',
        categoryIds: ['yellow', 'blue', 'green', 'orange', 'purple'],
      },
    },
  ],
};

export const builtInScoringConfigs: ScoringConfig[] = [terraformingMarsConfig, thatsSoCleverConfig];
