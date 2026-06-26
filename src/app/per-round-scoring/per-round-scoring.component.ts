import { Component, inject } from '@angular/core';
import { Player } from '@models/player';
import { PlayerSelectionComponent } from '@forms/player-selection/player-selection.component';
import { PerRoundScoringService } from './per-round-scoring.service';
import { PerRoundScoringGameComponent } from './per-round-scoring-game/per-round-scoring-game.component';

@Component({
  selector: 'st-per-round-scoring',
  imports: [PlayerSelectionComponent, PerRoundScoringGameComponent],
  template: `
    @if (gameService.gameInitialized()) {
      <st-per-round-scoring-game />
    } @else {
      <st-player-selection (selectPlayers)="startGame($event)" />
    }
  `,
  providers: [PerRoundScoringService],
})
export class PerRoundScoringComponent {
  readonly gameService = inject(PerRoundScoringService);

  startGame(players: Player[]): void {
    this.gameService.startGame(players);
  }
}
