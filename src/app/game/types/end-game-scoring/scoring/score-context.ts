import { CategoryValues } from '../_shared/models/category-values';

/** Everything a rule needs to score, whichever pass it runs in. */
export interface ScoreContext {
  /** This category's entered value. */
  value: number;
  /** All raw entered values, by category id (read by `multiplyCategory`). */
  entered: CategoryValues;
  /** Pass-1 computed points, by category id (read by `aggregateMultiply` in pass 2). */
  computedPoints: Record<string, number>;
}
