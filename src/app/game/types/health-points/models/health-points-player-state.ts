import { Player } from '@player/models/player';

/**
 * A player's health in one game: a starting life total plus an ordered list of signed changes
 * (damage negative, heal positive). Immutable — {@link adjust}/{@link edit}/{@link remove} return
 * new instances so the owning `players` signal replaces the array and `computed` life/winner
 * values recompute (mirrors {@link FreeFormPlayerScores}, with a seeded starting value instead of
 * a 0 baseline). "Set life to X" is expressed as the single delta `X - life()`, so every change —
 * quick step, custom amount, or direct set — flows through one uniform, fully-editable history.
 */
export class HealthPointsPlayerState {
  constructor(
    public readonly player: Player,
    public readonly startingLife: number,
    private readonly deltas: readonly number[] = [],
  ) {}

  /** Current life: the starting total plus every applied change. */
  life(): number {
    return this.deltas.reduce((sum, delta) => sum + delta, this.startingLife);
  }

  /** A player is out once their life reaches zero (or below). */
  eliminated(): boolean {
    return this.life() <= 0;
  }

  /** Whether any change has been applied (gates the history affordance). */
  changed(): boolean {
    return this.deltas.length > 0;
  }

  /** The raw signed changes, for serializing and for the history view. */
  entries(): readonly number[] {
    return this.deltas;
  }

  /** Apply a signed change (damage < 0, heal > 0). */
  adjust(delta: number): HealthPointsPlayerState {
    return new HealthPointsPlayerState(this.player, this.startingLife, [...this.deltas, delta]);
  }

  /** Correct a past change: replace the value at `index` (no-op if out of range). */
  edit(index: number, delta: number): HealthPointsPlayerState {
    return new HealthPointsPlayerState(
      this.player,
      this.startingLife,
      this.deltas.map((existing, i) => (i === index ? delta : existing)),
    );
  }

  /** Drop a wrong change entirely (no-op if out of range). */
  remove(index: number): HealthPointsPlayerState {
    return new HealthPointsPlayerState(
      this.player,
      this.startingLife,
      this.deltas.filter((_, i) => i !== index),
    );
  }
}
