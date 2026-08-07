import { Player } from '@player/models/player';
import { RoundScore } from './round-score';

/**
 * A player's running scores. Immutable: `addRoundScore`/`modifyRoundScore` return a new
 * instance so the owning `scores` signal can replace the array and let derived `computed`
 * state (table, trend, totals) recompute with no in-place mutation.
 */
export class PlayerScores {
  constructor(
    public readonly player: Player,
    private readonly scores: readonly RoundScore[] = [],
  ) {}

  total(): number {
    return this.scores.reduce((sum, s) => sum + s.score, 0);
  }

  /** The raw round scores, for serializing the game session to a persisted snapshot. */
  toRoundScores(): readonly RoundScore[] {
    return this.scores;
  }

  hasScoreForRound(round: number): boolean {
    return this.getRoundScore(round) !== undefined;
  }

  roundScore(round: number): number | null {
    return this.getRoundScore(round)?.score ?? null;
  }

  addRoundScore(round: number, score: number): PlayerScores {
    return new PlayerScores(this.player, [...this.scores, new RoundScore(round, score)]);
  }

  modifyRoundScore(round: number, newScore: number): PlayerScores {
    return new PlayerScores(
      this.player,
      this.scores.map((s) => (s.round === round ? new RoundScore(round, newScore) : s)),
    );
  }

  /**
   * Running total after each round this player has played, keyed by round id — cumulative
   * from the true start regardless of any later windowing/truncation of which rounds are
   * displayed. A round this player hasn't played yet (the in-progress final round, for
   * players later in turn order) has no entry.
   */
  cumulativeTotalsByRound(): ReadonlyMap<number, number> {
    const totals = new Map<number, number>();
    let running = 0;
    [...this.scores]
      .sort((a, b) => a.round - b.round)
      .forEach((s) => {
        running += s.score;
        totals.set(s.round, running);
      });
    return totals;
  }

  private getRoundScore(round: number): RoundScore | undefined {
    return this.scores.find((s) => s.round === round);
  }
}
