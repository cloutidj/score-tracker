import { ChartDataset } from 'chart.js';
import { Player } from '@models/player';

export class RoundScore {
  constructor(
    public readonly round: number,
    public readonly score: number,
  ) {}
}

/**
 * A player's running scores. Immutable: `addRoundScore`/`modifyRoundScore` return a new
 * instance so the owning `scores` signal can replace the array and let `computed` chart
 * data recompute (no in-place mutation of chart series like the legacy class did).
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

  /** Line series: cumulative running totals starting at `Start` (0), with per-player color. */
  toLineDataset(): ChartDataset<'line'> {
    const color = this.player.color;
    return {
      label: this.player.name,
      data: this.cumulativeTotals(),
      ...(color && {
        backgroundColor: color.rgbString(0.25),
        borderColor: color.rgbString(0.8),
        pointBackgroundColor: color.rgbString(),
      }),
    };
  }

  /** Bar series: a single grand-total bar, with per-player color. */
  toBarDataset(): ChartDataset<'bar'> {
    const color = this.player.color;
    return {
      label: this.player.name,
      data: [this.total()],
      ...(color && {
        backgroundColor: color.rgbString(0.8),
        borderColor: color.rgbString(),
        borderWidth: 3,
      }),
    };
  }

  private cumulativeTotals(): number[] {
    const totals = [0];
    let running = 0;
    [...this.scores]
      .sort((a, b) => a.round - b.round)
      .forEach((s) => {
        running += s.score;
        totals.push(running);
      });
    return totals;
  }

  private getRoundScore(round: number): RoundScore | undefined {
    return this.scores.find((s) => s.round === round);
  }
}
