import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Player } from '@player/models/player';
import { ButtonComponent } from '@ui/button/button.component';
import { NumberDialogService } from '@ui/number-entry/number-dialog/number-dialog.service';
import { ColorDirective } from '@color/color.directive';
import { PerRoundScoreTrendComponent, TrendSeries } from '../per-round-score-trend/per-round-score-trend.component';
import { PerRoundScoringService } from '../per-round-scoring.service';
import { GameRound } from '../models/game-round';

const ROUND_CUTOFF = 10;

@Component({
  selector: 'st-per-round-score-table',
  imports: [NgIcon, ButtonComponent, ColorDirective, PerRoundScoreTrendComponent],
  templateUrl: './per-round-score-table.component.html',
  styleUrl: './per-round-score-table.component.scss',
})
export class PerRoundScoreTableComponent {
  readonly gameService = inject(PerRoundScoringService);
  private readonly numberDialog = inject(NumberDialogService);

  readonly showAllRounds = signal(false);

  trimmedTable(): boolean {
    return this.gameService.gameRounds().length > ROUND_CUTOFF;
  }

  showRound(roundIndex: number): boolean {
    return this.showAllRounds() || roundIndex >= this.gameService.gameRounds().length - ROUND_CUTOFF;
  }

  /** Rounds currently shown as columns — the same window the embedded trend chart is fed. */
  readonly visibleRounds = computed(() =>
    this.gameService.gameRounds().filter((_, i) => this.showRound(i)),
  );

  /** Fixed-width columns so the trend chart's points land on each column's center. */
  readonly gridTemplateColumns = computed(
    () =>
      `repeat(${this.visibleRounds().length}, var(--st-per-round-score-table-column-width))`,
  );

  /** Per-player cumulative totals restricted to `visibleRounds`, for the embedded trend chart. */
  readonly trendSeries = computed<TrendSeries[]>(() => {
    const rounds = this.visibleRounds();
    return this.gameService.scores().map((ps) => {
      const byRound = ps.cumulativeTotalsByRound();
      return { player: ps.player, points: rounds.map((r) => byRound.get(r.roundId) ?? null) };
    });
  });

  /** Round ids for `visibleRounds`, doubling as the trend chart's tick labels. */
  readonly roundNumbers = computed(() => this.visibleRounds().map((r) => r.roundId));

  editScore(player: Player, round: GameRound, current: number | null): void {
    this.numberDialog
      .prompt({ player, action: round.label, value: current ?? 0 })
      .subscribe((val) => this.gameService.modifyScore(player, round.roundId, val));
  }
}
