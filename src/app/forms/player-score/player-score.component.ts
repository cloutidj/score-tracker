import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Player } from '@models/player';
import { PlayerColorDirective } from '@util/colors/player-color.directive';
import { NumberPadComponent } from '@util/number-pad/number-pad.component';

@Component({
  selector: 'st-player-score',
  imports: [MatCardModule, FontAwesomeModule, NumberPadComponent, PlayerColorDirective],
  templateUrl: './player-score.component.html',
  styleUrl: './player-score.component.scss',
})
export class PlayerScoreComponent {
  readonly player = input<Player>();
  readonly score = output<number>();
}
