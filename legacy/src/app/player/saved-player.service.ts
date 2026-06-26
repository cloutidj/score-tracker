import { PlayerBase } from './../models/player-base';
import { PlayerColor } from './../models/player-color';
import { DatabaseService } from '@util/database.service';
import { PlayerPreference } from '@models/player-preference';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const DB_KEY = 'SavedPlayers';

@Injectable({
  providedIn: 'root'
})
export class SavedPlayerService {
  private _savedPlayers: BehaviorSubject<PlayerPreference[]>;

  constructor(private database: DatabaseService) {
    let initData = this.database.get(DB_KEY);
    if (!Array.isArray(initData)) {
      initData = [];
      this.database.save(DB_KEY, initData);
    }

    this._savedPlayers = new BehaviorSubject<PlayerPreference[]>(initData);
  }

  public getSavedPlayers(): Observable<PlayerPreference[]> {
    return this._savedPlayers.pipe(map((players: PlayerPreference[]) => {
      players.forEach(player => player.color = Object.assign(new PlayerColor(0, 0, 0), player.color));
      return players;
    }));
  }

  private refresh(): void {
    this._savedPlayers.next(this.database.get(DB_KEY));
  }

  public addPlayer(player: PlayerBase): void {
    (player as PlayerPreference).playerPreferenceId = Date.now(); // use create timestamp as unique identifier for now
    this.database.add(DB_KEY, player);
    this.refresh();
  }

  public editPlayer(player: PlayerPreference): void {
    this.database.update(DB_KEY, player, this.findPlayer(player.playerPreferenceId));
    this.refresh();
  }

  public removePlayer(id: number): void {
    this.database.remove(DB_KEY, this.findPlayer(id));
    this.refresh();
  }

  private findPlayer(id: number): (player: PlayerPreference) => boolean {
    return (player: PlayerPreference) => player.playerPreferenceId === id;
  }
}
