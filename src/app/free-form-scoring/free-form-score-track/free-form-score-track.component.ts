import { Component, computed, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Player } from '@models/player';
import { PlayerColorDirective } from '@util/colors/player-color.directive';
import { FreeFormScoringService } from '../free-form-scoring.service';

interface TrackMarker {
  player: Player;
  total: number;
  /** 0–100 position along the shared lane (lowest score → 0%, highest → 100%). */
  posPercent: number;
  /** Alternate labels above/below the line so neighbours don't collide. */
  above: boolean;
  isLeader: boolean;
}

/**
 * A single shared number line with a dot per player positioned by their total, so it reads
 * at a glance who is in front/behind and (by the gaps between dots) by how much. The lane is
 * scaled to the current min…max of totals; a dashed zero tick appears only when the range
 * straddles zero (i.e. someone has gone negative). Labels alternate above/below the line to
 * keep close scores legible, and dots transition their position as scores change.
 */
@Component({
  selector: 'st-free-form-score-track',
  imports: [FontAwesomeModule, PlayerColorDirective],
  templateUrl: './free-form-score-track.component.html',
  styleUrl: './free-form-score-track.component.scss',
})
export class FreeFormScoreTrackComponent {
  private readonly gameService = inject(FreeFormScoringService);

  /** Min/max of current totals and whether they're all equal (a flat line). */
  private readonly bounds = computed(() => {
    const totals = this.gameService.scores().map((s) => s.total());
    if (!totals.length) {
      return { min: 0, max: 0, range: 1, flat: true };
    }
    const min = Math.min(...totals);
    const max = Math.max(...totals);
    const flat = min === max;
    return { min, max, range: flat ? 1 : max - min, flat };
  });

  readonly hasPlayers = computed(() => this.gameService.scores().length > 0);

  readonly markers = computed<TrackMarker[]>(() => {
    const { min, range, flat } = this.bounds();
    const leading = this.gameService.leadingTotal();
    const scored = this.gameService.scored();
    return this.gameService
      .scores()
      .map((s) => ({ player: s.player, total: s.total() }))
      // Lowest → highest, so left-to-right order matches the lane and the
      // above/below alternation separates adjacent (close-scoring) players.
      .sort((a, b) => a.total - b.total)
      .map((m, i) => ({
        player: m.player,
        total: m.total,
        posPercent: flat ? 50 : ((m.total - min) / range) * 100,
        above: i % 2 === 1,
        isLeader: scored && m.total === leading,
      }));
  });

  /** Show the zero tick only when totals straddle zero. */
  readonly zeroVisible = computed(() => {
    const { min, max } = this.bounds();
    return min < 0 && max > 0;
  });

  readonly zeroPercent = computed(() => {
    const { min, range } = this.bounds();
    return ((0 - min) / range) * 100;
  });
}
