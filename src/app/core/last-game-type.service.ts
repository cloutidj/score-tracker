import { Injectable } from '@angular/core';

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
  get(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  }

  set(gameTypeId: string): void {
    localStorage.setItem(STORAGE_KEY, gameTypeId);
  }
}
