import { InjectionToken } from '@angular/core';
import { Player } from '@player/models/player';

/**
 * Contract supplied to a `GameType.setupComponent`. The host provides it through the
 * setup component's injector ({@link GAME_SETUP_CONTEXT}); the component owns its whole setup
 * screen (player selection plus any config it needs) and calls {@link start} to launch the
 * game with the chosen players and config.
 */
export interface GameSetupContext<TConfig = unknown> {
  /** Launch the game for these players with the setup screen's chosen config. */
  start(players: Player[], config: TConfig): void;
}

/** Injected by a `GameType.setupComponent` to launch the game once setup is complete. */
export const GAME_SETUP_CONTEXT = new InjectionToken<GameSetupContext>('GAME_SETUP_CONTEXT');
