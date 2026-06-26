import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Player } from '@models/player';

@Component({
  selector: 'st-player-score',
  templateUrl: './player-score.component.html',
  styleUrls: [ './player-score.component.scss' ]
})
export class PlayerScoreComponent {
  @Input() player: Player;
  @Output() score = new EventEmitter<number>();
}
