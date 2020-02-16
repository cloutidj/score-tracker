import { PlayerBase } from '@models/player-base';
import { PlayerPreference } from '@models/player-preference';
import { PlayerColor } from '@models/player-color';
import { SavedPlayerService } from '../saved-player.service';
import { Component } from '@angular/core';
import { Util } from '@util/util';

@Component({
  selector: 'st-saved-players',
  templateUrl: './saved-players.component.html'
})
export class SavedPlayersComponent {
  public currentPlayer: PlayerPreference;
  public showForm = false;

  constructor(public savedPlayerService: SavedPlayerService) { }

  public distinctColors(players: PlayerPreference[]): PlayerColor[] {
    return Util.distinct(players.map(p => p.color), (color: PlayerColor) => color.hexString());
  }

  public saveValues(player: PlayerBase) {
    if (this.currentPlayer) {
      this.savedPlayerService.editPlayer(Object.assign(this.currentPlayer, player));
    } else {
      this.savedPlayerService.addPlayer(player);
    }
    this.showForm = false;
    this.currentPlayer = null;
  }

  public onAdd(): void {
    this.currentPlayer = null;
    this.showForm = true;
  }

  public onEdit(player: PlayerPreference): void {
    this.currentPlayer = player;
    this.showForm = true;
  }

  public onDelete(player: PlayerPreference): void {
    this.savedPlayerService.removePlayer(player.playerPreferenceId);
  }
}
