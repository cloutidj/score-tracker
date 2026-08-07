import { Component, input, output } from '@angular/core';
import { Player } from '@player/models/player';
import { ColorDirective } from '@color/color.directive';
import { NumberPadComponent } from '@ui/number-pad/number-pad.component';
import { ScoreEntryHeaderComponent } from '@ui/score-entry-header/score-entry-header.component';

@Component({
  selector: 'st-player-score',
  imports: [NumberPadComponent, ColorDirective, ScoreEntryHeaderComponent],
  templateUrl: './player-score.component.html',
  styleUrl: './player-score.component.scss',
})
export class PlayerScoreComponent {
  readonly player = input<Player>();
  readonly score = output<number>();
}
