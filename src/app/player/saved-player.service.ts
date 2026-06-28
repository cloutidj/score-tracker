import { Injectable, Signal, inject, signal } from '@angular/core';
import { DatabaseService } from '@util/database.service';
import { PlayerBase } from '@models/player-base';
import { PlayerColor } from '@models/player-color';
import { PlayerPreference } from '@models/player-preference';

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

  /** Read-only view of the saved players, colors re-hydrated to `PlayerColor` instances. */
  readonly savedPlayers: Signal<PlayerPreference[]> = this._savedPlayers.asReadonly();

  addPlayer(player: PlayerBase): void {
    // Use the create timestamp as the unique identifier for now.
    (player as PlayerPreference).playerPreferenceId = Date.now();
    this.database.add(DB_KEY, player);
    this.refresh();
  }

  editPlayer(player: PlayerPreference): void {
    this.database.update(DB_KEY, player, this.matchById(player.playerPreferenceId));
    this.refresh();
  }

  removePlayer(id: number): void {
    this.database.remove(DB_KEY, this.matchById(id));
    this.refresh();
  }

  private refresh(): void {
    this._savedPlayers.set(this.load());
  }

  private load(): PlayerPreference[] {
    const data = this.database.get<PlayerPreference[]>(DB_KEY);
    if (!Array.isArray(data)) {
      this.database.save(DB_KEY, []);
      return [];
    }

    return data.map((player) =>
      Object.assign(new PlayerPreference(), player, {
        color: Object.assign(new PlayerColor(), player.color),
      }),
    );
  }

  private matchById(id: number): (player: PlayerPreference) => boolean {
    return (player) => player.playerPreferenceId === id;
  }
}
