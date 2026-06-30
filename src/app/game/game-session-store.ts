import { Injectable, inject } from '@angular/core';
import { DatabaseService } from '@core/database.service';

/**
 * Generic persistence for in-progress games, namespaced by game-type id. This is the
 * core half of the Phase 4 persistence pattern, lifted out of the per-round service so
 * every game type gets resume-on-refresh for free: the play host saves a live session's
 * snapshot here on every change and clears it when the game ends, while the *shape* of
 * that snapshot stays the concrete {@link import('./game-type').GameSession}'s business.
 */
@Injectable({ providedIn: 'root' })
export class GameSessionStore {
  private readonly database = inject(DatabaseService);

  private key(gameTypeId: string): string {
    return `GameSession:${gameTypeId}`;
  }

  /** The persisted snapshot for this type, or `null` if there's no game to resume. */
  read(gameTypeId: string): unknown {
    return this.database.get(this.key(gameTypeId));
  }

  save(gameTypeId: string, snapshot: unknown): void {
    this.database.save(this.key(gameTypeId), snapshot);
  }

  clear(gameTypeId: string): void {
    this.database.delete(this.key(gameTypeId));
  }
}
