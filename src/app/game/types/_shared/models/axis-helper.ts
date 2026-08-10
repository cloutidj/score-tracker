/**
 * Shared linear-axis math for {@link import('../score-track/score-track.component').ScoreTrackComponent}
 * and {@link import('../../per-round-scoring/per-round-score-trend/per-round-score-trend.component').PerRoundScoreTrendComponent}:
 * both plot values along a `[min, min + range]` window, just into different output spaces
 * (a lane percentage vs. an SVG viewBox coordinate) and with different rules for how that
 * window itself is computed (score-track pads/anchors it; the trend doesn't) — so only the
 * point-to-fraction conversion is shared, not the window computation.
 */
export class AxisHelper {
  /** Where `value` falls between `min` and `min + range`, as an unclamped 0–1 fraction. */
  static fraction(value: number, min: number, range: number): number {
    return (value - min) / range;
  }

  /** Whether an axis spanning `[min, max]` crosses zero (i.e. a zero baseline should be drawn). */
  static straddlesZero(min: number, max: number): boolean {
    return min < 0 && max > 0;
  }
}
