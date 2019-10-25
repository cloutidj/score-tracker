import { Component } from '@angular/core';
import { PerRoundScoringService } from '../providers/per-round-scoring.service';

@Component({
  selector: 'st-per-round-scoring-game',
  templateUrl: './per-round-scoring-game.component.html',
  styleUrls: [ './per-round-scoring-game.component.scss' ]
})
export class PerRoundScoringGameComponent {
  constructor(public gameService: PerRoundScoringService) {}
}
