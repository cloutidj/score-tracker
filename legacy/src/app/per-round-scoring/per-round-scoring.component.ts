import { Component } from '@angular/core';
import { Player } from '@models/player';
import { PerRoundScoringService } from './providers/per-round-scoring.service';

@Component({
  selector: 'st-per-round-scoring',
  template: `
      <ng-container *ngIf="gameService.gameInitialized(); else setupGame">
          <st-per-round-scoring-game></st-per-round-scoring-game>
      </ng-container>

      <ng-template #setupGame>
          <st-player-selection (selectPlayers)="startGame($event)"></st-player-selection>
      </ng-template>`,
  providers: [ PerRoundScoringService ]
})
export class PerRoundScoringComponent {
  constructor(public gameService: PerRoundScoringService) {}

  public startGame(players: Player[]) {
    this.gameService.startGame(players);
  }
}
