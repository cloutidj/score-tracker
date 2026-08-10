import { Injectable, Signal, inject, signal } from '@angular/core';
import { DatabaseService } from '@core/database.service';
import { PlayerBase } from '@player/models/player-base';
import { PlayerPreference } from '@player/models/player-preference';

const DB_KEY = 'SavedPlayers';

/**
 * Signal-backed store over the persisted `SavedPlayers` list. The read path feeds the
 * import dropdown in `player-info` (pick a saved player to seed name + color); the
 * saved-players management UI is built on top of `addPlayer`/`editPlayer`/`removePlayer`.
 */
@Injectable({
  providedIn: 'root',
})
export class SavedPlayerService {
  private readonly database = inject(DatabaseService);
  private readonly _savedPlayers = signal<PlayerPreference[]>(this.load());

  readonly savedPlayers: Signal<PlayerPreference[]> = this._savedPlayers.asReadonly();

  addPlayer(player: PlayerBase): void {
    // The creation timestamp doubles as the unique identifier.
    const preference = player as PlayerPreference;
    preference.playerPreferenceId = Date.now();
    const next = this.database.add<PlayerPreference>(DB_KEY, preference);
    this._savedPlayers.set(this.toPreferences(next));
  }

  editPlayer(player: PlayerPreference): void {
    const next = this.database.update(DB_KEY, player, this.matchById(player.playerPreferenceId));
    this._savedPlayers.set(this.toPreferences(next));
  }

  removePlayer(id: number): void {
    const next = this.database.remove(DB_KEY, this.matchById(id));
    this._savedPlayers.set(this.toPreferences(next));
  }

  private toPreferences(data: PlayerPreference[]): PlayerPreference[] {
    return data.map((player) => Object.assign(new PlayerPreference(), player));
  }

  private load(): PlayerPreference[] {
    const data = this.database.get<PlayerPreference[]>(DB_KEY);
    if (!Array.isArray(data)) {
      this.database.save(DB_KEY, []);
      return [];
    }

    return this.toPreferences(data);
  }

  private matchById(id: number): (player: PlayerPreference) => boolean {
    return (player) => player.playerPreferenceId === id;
  }
}
