import { Component, Input } from '@angular/core';
import { PerRoundScoringGame } from '../models/per-round-scoring-game';

@Component({
  selector: 'st-per-round-scoring-game',
  template: `
      <div class="game-wrapper">
          <st-player-score [player]="game.currentPlayer"
                           (score)="game.addScore($event)"></st-player-score>

          <st-per-round-score-table [game]="game"></st-per-round-score-table>
      </div>  `,
  styleUrls: [ './per-round-scoring-game.component.scss' ]
})
export class PerRoundScoringGameComponent {
  @Input() game: PerRoundScoringGame;
}
