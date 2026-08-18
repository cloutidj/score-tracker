import { Component, computed, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { PlayerScoreComponent } from '../player-score/player-score.component';
import { ButtonComponent } from '@ui/button/button.component';
import { NewGameConfirmService } from '@game-types/_shared/new-game-confirm.service';
import { ScoreTrackComponent } from '@game-types/_shared/score-track/score-track.component';
import { PerRoundScoringService } from '../per-round-scoring.service';
import { PerRoundScoreTableComponent } from '../per-round-score-table/per-round-score-table.component';

@Component({
  selector: 'st-per-round-scoring-game',
  imports: [NgIcon, ButtonComponent, PlayerScoreComponent, ScoreTrackComponent, PerRoundScoreTableComponent],
  templateUrl: './per-round-scoring-game.component.html',
  styleUrl: './per-round-scoring-game.component.scss',
})
export class PerRoundScoringGameComponent {
  readonly gameService = inject(PerRoundScoringService);
  private readonly confirm = inject(NewGameConfirmService);

  readonly trackEntries = computed(() =>
    this.gameService.scores().map((s) => ({ player: s.player, total: s.total() })),
  );

  newGame(): void {
    this.confirm.newGame(() => this.gameService.reset());
  }
}
