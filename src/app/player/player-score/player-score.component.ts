import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Player } from '@player/models/player';
import { PlayerColorDirective } from '@player/colors/player-color.directive';
import { NumberPadComponent } from '@ui/number-pad/number-pad.component';
import { ScoreEntryHeaderComponent } from '@ui/score-entry-header/score-entry-header.component';

@Component({
  selector: 'st-player-score',
  imports: [MatCardModule, NumberPadComponent, PlayerColorDirective, ScoreEntryHeaderComponent],
  templateUrl: './player-score.component.html',
  styleUrl: './player-score.component.scss',
})
export class PlayerScoreComponent {
  readonly player = input<Player>();
  readonly score = output<number>();
}
