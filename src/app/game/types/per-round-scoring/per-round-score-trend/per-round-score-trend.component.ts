import { Component, computed, input } from '@angular/core';
import { Player } from '@player/models/player';
import { StColor } from '@color/models/st-color';
import { ColorDirective } from '@color/color.directive';

export interface TrendSeries {
  player: Player;
  /** One entry per visible round, in order; `null` for a round this player hasn't played yet. */
  points: (number | null)[];
}

interface PlottedPoint {
  x: number;
  y: number;
}

interface PlottedRun {
  points: PlottedPoint[];
  path: string;
}

interface PlottedSeries {
  playerNumber: number;
  color: StColor;
  runs: PlottedRun[];
}

interface Tick {
  percent: number;
  label: number;
}

const VIEW_WIDTH = 300;
const VIEW_HEIGHT = 140;
// Vertical breathing room so a point sitting at the exact min/max isn't clipped by its own stroke.
const MARGIN_Y = 10;

/**
 * Splits a per-round points array into runs of contiguous known values, each entry keeping
 * its original column index — a `null` (a round this player hasn't reached yet) breaks the
 * line there instead of connecting across the gap or plotting a fabricated value.
 */
function toRuns(points: readonly (number | null)[]): { index: number; value: number }[][] {
  const runs: { index: number; value: number }[][] = [];
  let current: { index: number; value: number }[] = [];
  points.forEach((value, index) => {
    if (value === null) {
      if (current.length) {
        runs.push(current);
      }
      current = [];
    } else {
      current.push({ index, value });
    }
  });
  if (current.length) {
    runs.push(current);
  }
  return runs;
}

/**
 * A lightweight, skin-aware replacement for the chart.js line chart: one line per player
 * plotting their cumulative total across rounds. One point sits at the center of each round
 * column — this component is embedded inside `PerRoundScoreTableComponent`'s own header row,
 * spanning exactly its round `<col>`s, so the points line up with the columns below with no
 * separate measurement. The SVG stretches to fill its box in both dimensions independently
 * (`preserveAspectRatio="none"`) so a fixed-height row can span an arbitrarily wide, scrollable
 * table without the chart growing tall to match. Colors flow through `[stColor]`/`--st-player-color`
 * exactly like the score track.
 *
 * Round-number ticks are plain HTML, positioned by percentage, rather than SVG `<text>` — the
 * SVG's `viewBox` scale (abstract units per real pixel) varies with how many columns are
 * visible, so text sized in viewBox units would render at an inconsistent real size depending
 * on column count. HTML text sized in `rem` doesn't have that problem, the same reason the
 * score track's own labels are HTML spans rather than SVG text.
 */
@Component({
  selector: 'st-per-round-score-trend',
  imports: [ColorDirective],
  templateUrl: './per-round-score-trend.component.html',
  styleUrl: './per-round-score-trend.component.scss',
})
export class PerRoundScoreTrendComponent {
  readonly series = input.required<TrendSeries[]>();
  readonly roundNumbers = input.required<readonly number[]>();

  readonly viewWidth = VIEW_WIDTH;
  readonly viewBox = `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`;

  readonly hasRounds = computed(() => this.roundNumbers().length > 0);

  readonly ticks = computed<Tick[]>(() => {
    const numbers = this.roundNumbers();
    return numbers.map((label, i) => ({ percent: ((i + 0.5) / numbers.length) * 100, label }));
  });

  private readonly bounds = computed(() => {
    const values = this.series().flatMap((s) => s.points.filter((v): v is number => v !== null));
    if (!values.length) {
      return { min: 0, max: 0, range: 1 };
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { min, max, range: max === min ? 1 : max - min };
  });

  readonly plotted = computed<PlottedSeries[]>(() => {
    const { min, range } = this.bounds();
    const count = this.roundNumbers().length;
    const toXY = (index: number, value: number): PlottedPoint => ({
      x: ((index + 0.5) / count) * VIEW_WIDTH,
      y: VIEW_HEIGHT - MARGIN_Y - ((value - min) / range) * (VIEW_HEIGHT - 2 * MARGIN_Y),
    });
    return this.series().map((s) => ({
      playerNumber: s.player.playerNumber,
      color: s.player.color,
      runs: toRuns(s.points).map((run) => {
        const points = run.map((r) => toXY(r.index, r.value));
        return { points, path: points.map((p) => `${p.x},${p.y}`).join(' ') };
      }),
    }));
  });

  /** Show a dashed zero baseline only when totals straddle zero. */
  readonly zeroVisible = computed(() => {
    const { min, max } = this.bounds();
    return min < 0 && max > 0;
  });

  readonly zeroY = computed(() => {
    const { min, range } = this.bounds();
    return VIEW_HEIGHT - MARGIN_Y - ((0 - min) / range) * (VIEW_HEIGHT - 2 * MARGIN_Y);
  });
}
