import { Injectable, inject } from '@angular/core';
import { DatabaseService } from '@core/database.service';

const STORAGE_KEY = 'st-last-game-type';

/**
 * Remembers which game type the player was last on, so the app can reopen
 * straight into it instead of always landing on a game-type picker. Read once
 * per navigation rather than reactively, so this is a plain get/set, not a
 * signal — {@link SkinService}/{@link ThemeService} are the reactive-preference
 * shape; this is closer to "which route to redirect to."
 */
@Injectable({ providedIn: 'root' })
export class LastGameTypeService {
  private readonly database = inject(DatabaseService);

  get(): string | null {
    return this.database.get<string>(STORAGE_KEY);
  }

  set(gameTypeId: string): void {
    this.database.save(STORAGE_KEY, gameTypeId);
  }
}
