import { inject } from '@angular/core';
import { Player } from '@player/models/player';
import { GameSession, GameType } from '@game/game-type';
import { PerRoundScoringService, PerRoundSessionSnapshot } from './per-round-scoring.service';
import { PerRoundScoringGameComponent } from './per-round-scoring-game/per-round-scoring-game.component';

/**
 * {@link GameType} for take-turns-in-order, per-round increments. Registers the per-round
 * service (as its {@link GameSession}) and game component. Both factories run in an
 * injection context, so they `inject()` the root-provided service and hand back the same
 * singleton, started or rehydrated.
 *
 * Has no custom setup (`setupComponent` omitted): players are the only setup it needs.
 */
export const perRoundGameType: GameType = {
  id: 'per-round',
  title: 'Scoring Per Round Game',
  description: 'Players score every round on their turn and keep a running total',
  icon: 'table-list',
  gameComponent: PerRoundScoringGameComponent,

  createSession(players: Player[]): GameSession {
    const session = inject(PerRoundScoringService);
    session.startGame(players);
    return session;
  },

  restoreSession(snapshot: unknown): GameSession {
    const session = inject(PerRoundScoringService);
    session.fromSnapshot(snapshot as PerRoundSessionSnapshot);
    return session;
  },
};
