import { inject } from '@angular/core';
import { Player } from '@player/models/player';
import { GameSession } from '@game/game-session';
import { GameType } from '@game/game-type';
import { HealthPointsService } from './health-points.service';
import { HealthPointsConfig } from './models/health-points-config';
import { HealthPointsSnapshot } from './models/health-points-snapshot';
import { HealthPointsGameComponent } from './health-points-game/health-points-game.component';
import { HealthPointsSetupComponent } from './health-points-setup/health-points-setup.component';

/**
 * Health-points {@link GameType}: every player starts at a chosen life total and takes signed
 * damage/heal at any time, counting down; reaching 0 eliminates them and the last standing wins.
 * Its `setupComponent` ({@link HealthPointsSetupComponent}) captures the starting life total (the
 * {@link HealthPointsConfig}) alongside player selection.
 */
export const healthPointsGameType: GameType<HealthPointsConfig> = {
  id: 'health-points',
  title: 'Health / Life Totals',
  description: 'Track life totals that count down from a starting value; last player standing wins',
  icon: 'phosphorHeart',
  setupComponent: HealthPointsSetupComponent,
  gameComponent: HealthPointsGameComponent,

  createSession(players: Player[], config: HealthPointsConfig): GameSession {
    const session = inject(HealthPointsService);
    session.startGame(players, config);
    return session;
  },

  restoreSession(snapshot: unknown): GameSession {
    const session = inject(HealthPointsService);
    session.fromSnapshot(snapshot as HealthPointsSnapshot);
    return session;
  },
};
