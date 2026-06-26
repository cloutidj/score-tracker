import { Component, input, output } from '@angular/core';
import { ClrIcon } from '@clr/angular';
import { Player } from '@models/player';
import { NumberPadComponent } from '@util/number-pad/number-pad.component';

@Component({
  selector: 'st-player-score',
  imports: [ClrIcon, NumberPadComponent],
  templateUrl: './player-score.component.html',
  styleUrl: './player-score.component.scss',
})
export class PlayerScoreComponent {
  readonly player = input<Player>();
  readonly score = output<number>();
}
