import { Injectable, inject } from '@angular/core';
import { GAME_TYPE, GameType } from './game-type';

/**
 * Root registry of the {@link GameType}s the app knows about. Populated declaratively
 * through the {@link GAME_TYPE} multi-provider, so adding a type never touches this class.
 * Home renders a card per `all()`; the play host resolves the active type with `byId()`.
 */
@Injectable({ providedIn: 'root' })
export class GameTypeRegistry {
  private readonly types = inject(GAME_TYPE);

  all(): readonly GameType[] {
    return this.types;
  }

  byId(id: string): GameType | undefined {
    return this.types.find((type) => type.id === id);
  }
}
