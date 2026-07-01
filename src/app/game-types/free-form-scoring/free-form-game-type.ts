import { inject } from '@angular/core';
import { Player } from '@player/models/player';
import { GameSession, GameType } from '@game/game-type';
import { FreeFormScoringService, FreeFormSnapshot } from './free-form-scoring.service';
import { FreeFormScoringGameComponent } from './free-form-scoring-game/free-form-scoring-game.component';

/**
 * Free-form scoring {@link GameType}: score any player at any time; totals are the sum of
 * every entry — no turn order, no rounds. No setup beyond player selection
 * (`setupComponent` omitted).
 */
export const freeFormGameType: GameType = {
  id: 'free-form',
  title: 'Free-for-All Scoring',
  description: 'Add points to any player at any time; totals are the sum of every score',
  icon: 'plus-minus',
  gameComponent: FreeFormScoringGameComponent,

  createSession(players: Player[]): GameSession {
    const session = inject(FreeFormScoringService);
    session.startGame(players);
    return session;
  },

  restoreSession(snapshot: unknown): GameSession {
    const session = inject(FreeFormScoringService);
    session.fromSnapshot(snapshot as FreeFormSnapshot);
    return session;
  },
};
