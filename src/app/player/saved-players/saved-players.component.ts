import { Component, inject, signal } from '@angular/core';
import { transition, trigger } from '@angular/animations';
import { ClarityModule } from '@clr/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlayerBase } from '@models/player-base';
import { PlayerColor } from '@models/player-color';
import { PlayerPreference } from '@models/player-preference';
import { Util } from '@util/util';
import { slideInLeft } from '@util/animations/in-out.animations';
import { SmoothGrowComponent } from '@util/animations/smooth-grow.component';
import { ColorFilterComponent } from '@util/colors/color-filter/color-filter.component';
import { ColorSwatchComponent } from '@util/colors/color-swatch/color-swatch.component';
import { SavedPlayerService } from '@player/saved-player.service';
import { PlayerPreferencesFormComponent } from '../player-preferences-form/player-preferences-form.component';

@Component({
  selector: 'st-saved-players',
  imports: [
    ClarityModule,
    FontAwesomeModule,
    SmoothGrowComponent,
    ColorFilterComponent,
    ColorSwatchComponent,
    PlayerPreferencesFormComponent,
  ],
  templateUrl: './saved-players.component.html',
  styleUrl: './saved-players.component.scss',
  animations: [trigger('formAnimation', [transition(':enter', slideInLeft)])],
})
export class SavedPlayersComponent {
  readonly savedPlayerService = inject(SavedPlayerService);

  readonly currentPlayer = signal<PlayerPreference | null>(null);
  readonly showForm = signal(false);

  distinctColors(players: PlayerPreference[]): PlayerColor[] {
    return Util.distinct(
      players.map((p) => p.color),
      (color) => color.hexString(),
    );
  }

  saveValues(player: PlayerBase): void {
    const current = this.currentPlayer();
    if (current) {
      this.savedPlayerService.editPlayer(Object.assign(current, player));
    } else {
      this.savedPlayerService.addPlayer(player);
    }
    this.showForm.set(false);
    this.currentPlayer.set(null);
  }

  onAdd(): void {
    this.currentPlayer.set(null);
    this.showForm.set(true);
  }

  onEdit(player: PlayerPreference): void {
    this.currentPlayer.set(player);
    this.showForm.set(true);
  }

  onDelete(player: PlayerPreference): void {
    this.savedPlayerService.removePlayer(player.playerPreferenceId);
  }
}
