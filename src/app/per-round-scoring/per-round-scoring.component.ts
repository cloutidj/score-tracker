import { Component } from '@angular/core';
import { PerRoundScoringGame } from './models/per-round-scoring-game';
import { Player } from '@models/player';

@Component({
  selector: 'st-per-round-scoring',
  template: `
      <ng-container *ngIf="game; else setupGame">
          <st-per-round-scoring-game [game]="game"></st-per-round-scoring-game>
      </ng-container>

      <ng-template #setupGame>
          <st-player-selection (selectPlayers)="startGame($event)"></st-player-selection>
      </ng-template>`
})
export class PerRoundScoringComponent {
  public game: PerRoundScoringGame;

  public startGame(players: Player[]) {
    this.game = new PerRoundScoringGame(players);
  }
}
