export interface PlayerScoreBreakdown {
  /** Points contributed by each category, keyed by category id. */
  categoryPoints: Record<string, number>;
  total: number;
}
