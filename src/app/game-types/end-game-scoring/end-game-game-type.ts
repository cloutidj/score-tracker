import { inject } from '@angular/core';
import { Player } from '@player/models/player';
import { GameSession, GameType } from '@game/game-type';
import { EndGameScoringService, EndGameSnapshot } from './end-game-scoring.service';
import { EndGameScoringGameComponent } from './end-game-scoring-game/end-game-scoring-game.component';
import { EndGameSetupComponent } from './end-game-setup/end-game-setup.component';
import { ScoringConfig } from './models/scoring-config';

/**
 * End-game scoring {@link GameType}: players fill in per-category totals and a final score is
 * computed from a chosen {@link ScoringConfig}'s rules. The first type to use the descriptor's
 * self-owned-setup seam — its `setupComponent` ({@link EndGameSetupComponent}) picks the scoring
 * rule set (a built-in or a user-saved config) alongside player selection on one screen, and the
 * chosen config becomes this type's `TConfig`, handed to {@link EndGameScoringService}.
 */
export const endGameGameType: GameType<ScoringConfig> = {
  id: 'end-game',
  title: 'End-Game Scoring',
  description:
    "Fill in per-category totals at the end; final scores are computed from the game's rules",
  icon: 'list-check',
  setupComponent: EndGameSetupComponent,
  gameComponent: EndGameScoringGameComponent,

  createSession(players: Player[], config: ScoringConfig): GameSession {
    const session = inject(EndGameScoringService);
    session.startGame(players, config);
    return session;
  },

  restoreSession(snapshot: unknown): GameSession {
    const session = inject(EndGameScoringService);
    session.fromSnapshot(snapshot as EndGameSnapshot);
    return session;
  },
};
