import { Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Player } from '@player/models/player';
import { ColorDirective } from '@color/color.directive';
import { NumberChangeDirective } from '@ui/number-change/number-change.directive';
import { AxisHelper } from '@game-types/_shared/models/axis-helper';

export interface ScoreTrackEntry {
  player: Player;
  total: number;
}

// A gap between two totals is floored at this fraction of the largest magnitude in play, so a
// small gap between otherwise-large totals (35 vs. 39) doesn't get stretched to fill the whole
// lane the way zooming purely to [min, max] would — the visual gap tracks how big it actually is
// relative to the scores involved, not just relative to itself.
const RANGE_FLOOR_FRACTION = 0.5;

// Minimum horizontal separation (as a % of lane width) two above/below labels need before
// they're allowed to share a row. Sized against the worst case — two labels both at the
// `.label` CSS max-width (6rem = 96px) sitting on the narrowest lane this component actually
// renders in (~220px on a small phone) — so it holds regardless of how long the player names
// are. Below this, a label spills onto a deeper row on its side rather than overlapping.
const MIN_LABEL_GAP_PERCENT = 45;

// Dot geometry (rem). Sized to hold the score text it carries (2–3 digits) legibly.
const DOT_SIZE_REM = 1.9;
const DOT_HALF_REM = DOT_SIZE_REM / 2;

// Minimum horizontal separation (as a % of lane width) two distinct-score dots need before one
// is allowed to visually cover the other's score text. Sized the same way as the label gap —
// against the dot's own size (1.9rem) on the narrowest lane this component actually renders in
// (~220px) — so two close-but-different totals (e.g. 35 vs. 36) still each show a fully
// readable number instead of one dot burying the other.
const MIN_DOT_GAP_PERCENT = 15;

/**
 * Pushes left-to-right sorted positions apart until each is at least `minGap` from its
 * predecessor. If that pushes the last one past 100% (a tight, leader-anchored cluster with a
 * lone low outlier does this), pull back from the right instead of shifting the whole chain:
 * the leader needs to stay pinned at 100%, so a uniform shift would either move it off that
 * edge or drag the outlier further off the left one. A final clamp to 0 is a last resort for
 * more points than the lane can fit even at minimum spacing.
 */
function declutter(positions: number[], minGap: number): number[] {
  const result = [...positions];
  for (let i = 1; i < result.length; i++) {
    result[i] = Math.max(result[i], result[i - 1] + minGap);
  }
  if (result.at(-1)! > 100) {
    result[result.length - 1] = 100;
    for (let i = result.length - 2; i >= 0; i--) {
      result[i] = Math.min(result[i], result[i + 1] - minGap);
    }
  }
  return result.map((p) => Math.max(0, p));
}
// Vertical distance between the centers of two dots stacked for a tie.
const STACK_STEP_REM = DOT_SIZE_REM + 0.25;
// Gap between a dot's outer edge and the near edge of its label.
const LABEL_EDGE_GAP_REM = 0.4;
// Extra vertical distance between successive collision rows on the same side.
const LABEL_ROW_GAP_REM = 1.1;
// Above/below labels rotate this many degrees off horizontal (see `LABEL_LINE_REM` below) so
// they fan away from the line on a diagonal instead of running parallel to it — two labels
// that would collide head-on at 0° can still both be legible at 45°, since most of their
// length points away from each other rather than at each other. Every label pivots off its
// first letter (nearest the dot), then angles away from the line — up and to the right for an
// above label, down and to the right for a below one (see the `.label` rules in the
// component's stylesheet) — so a label near the lane's right edge, including the leader
// (always pinned at 100%), can run past it if its name is long enough. That's an accepted
// trade-off for every label reading naturally outward from its own dot.
const LABEL_ROTATION_DEG = 45;
// Must match the `.label` CSS max-width/line-height — used only to size the lane's reserved
// room (below), not to lay anything out, so a mismatch would just under/over-reserve space
// rather than misalign anything.
const LABEL_MAX_WIDTH_REM = 6;
const LABEL_LINE_HEIGHT_REM = 1;

// Room reserved beyond a label's near edge for its rotated bounding box. A horizontal label
// only needed its own line height here; rotated `LABEL_ROTATION_DEG` off horizontal, a box of
// width `w` and line-height `h` instead projects `(w + h) * sin(rotation)` past its anchor.
// Worst-cased against the `.label` max-width the same way the gap constants above are, so the
// lane doesn't reflow as names change length.
const LABEL_LINE_REM =
  (LABEL_MAX_WIDTH_REM + LABEL_LINE_HEIGHT_REM) * Math.sin((LABEL_ROTATION_DEG * Math.PI) / 180);

type LabelPlacement = 'above' | 'below' | 'left' | 'right';

interface TrackDot {
  player: Player;
  total: number;
  /** 0–100 position along the shared lane (lowest score → 0%, highest → 100%). */
  posPercent: number;
  /** This dot's own vertical offset (rem) from the line; nonzero only when tied with others. */
  dotOffsetRem: number;
  isLeader: boolean;
  labelPlacement: LabelPlacement;
  /**
   * For 'above'/'below': distance (rem) from the line to the label's near edge. For
   * 'left'/'right': the vertical offset (rem) from the line the label sits at (matches the
   * dot's own offset, since a sideways label sits beside its dot rather than beyond it).
   */
  labelOffsetRem: number;
  /** Length (rem) of the connecting stem drawn between the dot's edge and its label's near
   *  edge; 0 for 'left'/'right' labels, which sit directly beside their dot instead. */
  stemLengthRem: number;
}

interface ScoreGroup {
  total: number;
  posPercent: number;
  entries: ScoreTrackEntry[];
}

/** Collapses same-total entries (already sorted, so ties are adjacent) into stacking groups. */
function groupByTotal(sorted: ScoreTrackEntry[], positions: number[]): ScoreGroup[] {
  const groups: ScoreGroup[] = [];
  sorted.forEach((entry, i) => {
    const current = groups.at(-1);
    if (current && current.total === entry.total) {
      current.entries.push(entry);
    } else {
      groups.push({ total: entry.total, posPercent: positions[i], entries: [entry] });
    }
  });
  return groups;
}

interface PendingDot {
  entry: ScoreTrackEntry;
  posPercent: number;
  dotOffsetRem: number;
  /**
   * A lone dot ('free') has the whole line to itself, so its label can go either way. The
   * top/bottom of a tie-stack still has clear room beyond the stack's own end. Anything
   * sandwiched in between ('middle') doesn't — it labels sideways instead.
   */
  role: 'free' | 'top' | 'bottom' | 'middle';
}

/** Stacks a group's tied dots symmetrically around the line and classifies each one's role. */
function stackGroup(group: ScoreGroup): PendingDot[] {
  const k = group.entries.length;
  return group.entries.map((entry, i) => ({
    entry,
    posPercent: group.posPercent,
    dotOffsetRem: (i - (k - 1) / 2) * STACK_STEP_REM,
    role: k === 1 ? 'free' : i === 0 ? 'top' : i === k - 1 ? 'bottom' : 'middle',
  }));
}

interface LabelSlot {
  posPercent: number;
  /** 'top'/'bottom' roles already know their side; only a lone dot needs one chosen for it. */
  fixedSide?: 'above' | 'below';
}

/**
 * Assigns each (left-to-right ordered) label slot a side and a stacking row. A slot with a
 * fixed side (the top/bottom of a tie-stack) only searches rows on that side; a free slot
 * (a lone dot) alternates above/below so neighbours split apart by default. Either way, a
 * slot spills onto a deeper row on its side when it's too close (in lane %) to the last label
 * already placed in the nearest row there — which is what a cluster of close scores produces
 * once the lane zooms in on them.
 */
function assignLabelRows(slots: LabelSlot[]): { side: 'above' | 'below'; row: number }[] {
  const lastByRow: { above: number[]; below: number[] } = { above: [], below: [] };
  let freeCount = 0;
  return slots.map((slot) => {
    const sides: ('above' | 'below')[] = slot.fixedSide
      ? [slot.fixedSide]
      : freeCount++ % 2 === 1
        ? ['above', 'below']
        : ['below', 'above'];
    for (const side of sides) {
      const rows = lastByRow[side];
      for (let row = 0; row < rows.length; row++) {
        if (slot.posPercent - rows[row] >= MIN_LABEL_GAP_PERCENT) {
          rows[row] = slot.posPercent;
          return { side, row };
        }
      }
    }
    const side = sides[0];
    const rows = lastByRow[side];
    const row = rows.length;
    rows.push(slot.posPercent);
    return { side, row };
  });
}

/**
 * A single shared number line with a dot per player positioned by their total — the score is
 * printed inside the dot, so it reads at a glance who is in front/behind and (by the gaps
 * between dots) by how much. Players tied on the same total stack their dots symmetrically
 * around the line rather than hiding behind one another. The lane zooms to the current
 * min…max of totals, floored at a fraction of the largest total in play (see
 * `RANGE_FLOOR_FRACTION`) so a small gap between large totals doesn't get stretched to fill
 * the whole lane — and the leader always sits at the lane's right edge, so any floor padding
 * shows up as truncated room below the lowest score rather than dead space past the leader.
 * A dashed zero tick appears only when totals straddle zero (i.e. someone has
 * gone negative). Name labels go above/below a lone dot or the top/bottom of a tie-stack — on
 * a diagonal, connected back to their dot by a short stem, so close scores fan apart instead
 * of running into each other — and sideways for any dot sandwiched inside a 3+-way tie. Dots
 * transition their position as scores change.
 *
 * Shared by every scoring mode with a running per-player total (free-form, per-round) — the
 * host supplies its own entries/leader signals rather than this component reading a service.
 */
@Component({
  selector: 'st-score-track',
  imports: [NgIcon, ColorDirective, NumberChangeDirective],
  templateUrl: './score-track.component.html',
  styleUrl: './score-track.component.scss',
})
export class ScoreTrackComponent {
  readonly entries = input.required<ScoreTrackEntry[]>();
  readonly leadingTotal = input.required<number>();
  readonly scored = input.required<boolean>();

  /**
   * The lane's plotting window. `effectiveMin`/`range` describe that window (which may be
   * wider than the actual `[min, max]` spread once the floor kicks in); `min`/`max` stay the
   * real totals, since the zero-tick check cares about actual sign, not the padded window.
   */
  private readonly bounds = computed(() => {
    const totals = this.entries().map((e) => e.total);
    if (!totals.length) {
      return { min: 0, max: 0, effectiveMin: 0, range: 1, flat: true };
    }
    const min = Math.min(...totals);
    const max = Math.max(...totals);
    const flat = min === max;
    if (flat) {
      return { min, max, effectiveMin: min, range: 1, flat };
    }
    const actualRange = max - min;
    const magnitude = Math.max(Math.abs(min), Math.abs(max));
    const range = Math.max(actualRange, magnitude * RANGE_FLOOR_FRACTION);
    // Anchor the window to the leader: max always lands at the lane's right edge (100%), so
    // the leader is never floating with dead space beyond it. Any padding from the floor goes
    // entirely on the left instead, reading as "the scale below the lowest score is truncated"
    // rather than shrinking how far ahead the leader looks.
    const effectiveMin = max - range;
    return { min, max, effectiveMin, range, flat };
  });

  readonly hasPlayers = computed(() => this.entries().length > 0);

  readonly dots = computed<TrackDot[]>(() => {
    const { effectiveMin, range, flat } = this.bounds();
    const leading = this.leadingTotal();
    const scored = this.scored();
    // Lowest → highest, so left-to-right order matches the lane and ties end up adjacent.
    const sorted = [...this.entries()].sort((a, b) => a.total - b.total);
    const positions = sorted.map((e) =>
      flat ? 50 : AxisHelper.fraction(e.total, effectiveMin, range) * 100,
    );
    const groups = groupByTotal(sorted, positions);
    // Distinct-but-close totals (e.g. 35 vs. 36) can still land close enough that one dot would
    // cover the other's score text — nudge group centers apart, independent of the tie-stacking
    // below (which only ever applies to genuinely equal totals).
    const declutteredCenters = declutter(
      groups.map((g) => g.posPercent),
      MIN_DOT_GAP_PERCENT,
    );
    groups.forEach((g, i) => (g.posPercent = declutteredCenters[i]));
    const pending = groups.flatMap(stackGroup);

    const rows = assignLabelRows(
      pending
        .filter((d) => d.role !== 'middle')
        .map((d) => ({
          posPercent: d.posPercent,
          fixedSide: d.role === 'top' ? 'above' : d.role === 'bottom' ? 'below' : undefined,
        })),
    );

    let rowIndex = 0;
    let middleCount = 0;
    return pending.map((d) => {
      const isLeader = scored && d.entry.total === leading;
      if (d.role === 'middle') {
        return {
          player: d.entry.player,
          total: d.entry.total,
          posPercent: d.posPercent,
          dotOffsetRem: d.dotOffsetRem,
          isLeader,
          labelPlacement: middleCount++ % 2 === 0 ? 'right' : 'left',
          labelOffsetRem: d.dotOffsetRem,
          stemLengthRem: 0,
        };
      }
      const { side, row } = rows[rowIndex++];
      const dotEdgeRem = Math.abs(d.dotOffsetRem) + DOT_HALF_REM;
      const stemLengthRem = LABEL_EDGE_GAP_REM + row * LABEL_ROW_GAP_REM;
      return {
        player: d.entry.player,
        total: d.entry.total,
        posPercent: d.posPercent,
        dotOffsetRem: d.dotOffsetRem,
        isLeader,
        labelPlacement: side,
        labelOffsetRem: dotEdgeRem + stemLengthRem,
        stemLengthRem,
      };
    });
  });

  /** How much vertical room (rem, one side) the tallest stack/label combination needs. */
  private readonly laneExtentRem = computed(() => {
    const extents = this.dots().map((d) =>
      d.labelPlacement === 'left' || d.labelPlacement === 'right'
        ? Math.abs(d.dotOffsetRem) + DOT_HALF_REM
        : d.labelOffsetRem + LABEL_LINE_REM,
    );
    return Math.max(DOT_HALF_REM, ...extents);
  });

  /** Lane height (rem): symmetric room above and below the line for the tallest stack/label. */
  readonly laneHeightRem = computed(() => 2 * this.laneExtentRem());

  /** Show the zero tick only when totals straddle zero. */
  readonly zeroVisible = computed(() => {
    const { min, max } = this.bounds();
    return AxisHelper.straddlesZero(min, max);
  });

  readonly zeroPercent = computed(() => {
    const { effectiveMin, range } = this.bounds();
    return AxisHelper.fraction(0, effectiveMin, range) * 100;
  });
}
