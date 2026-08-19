import { Component, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { PlayerPreference } from '@player/models/player-preference';
import { IconButtonComponent } from '@ui/button/icon-button.component';
import { ColorDirective } from '@color/color.directive';

/** One saved player as a themed row, with edit/delete actions. */
@Component({
  selector: 'st-saved-player-row',
  imports: [NgIcon, IconButtonComponent, ColorDirective],
  templateUrl: './saved-player-row.component.html',
  styleUrl: './saved-player-row.component.scss',
})
export class SavedPlayerRowComponent {
  readonly player = input.required<PlayerPreference>();
  readonly rowsReady = input(false);

  readonly edit = output<void>();
  readonly delete = output<void>();
}
