import { Player } from '@models/player';

/**
 * A player's free-form scores: an ordered list of point entries with no notion of rounds
 * or turns. Immutable — {@link add} returns a new instance so the owning `scores` signal
 * can replace the array and let `computed` totals/leaders recompute (mirrors the per-round
 * model's immutability, minus the round bookkeeping this game type doesn't have).
 */
export class FreeFormPlayerScores {
  constructor(
    public readonly player: Player,
    private readonly scores: readonly number[] = [],
  ) {}

  total(): number {
    return this.scores.reduce((sum, score) => sum + score, 0);
  }

  count(): number {
    return this.scores.length;
  }

  /** The raw entries, for serializing the session to a persisted snapshot. */
  entries(): readonly number[] {
    return this.scores;
  }

  add(score: number): FreeFormPlayerScores {
    return new FreeFormPlayerScores(this.player, [...this.scores, score]);
  }

  /** Correct a mistyped entry: replace the value at `index` (no-op if out of range). */
  edit(index: number, score: number): FreeFormPlayerScores {
    return new FreeFormPlayerScores(
      this.player,
      this.scores.map((existing, i) => (i === index ? score : existing)),
    );
  }

  /** Drop a wrong entry entirely (no-op if out of range). */
  remove(index: number): FreeFormPlayerScores {
    return new FreeFormPlayerScores(
      this.player,
      this.scores.filter((_, i) => i !== index),
    );
  }
}
