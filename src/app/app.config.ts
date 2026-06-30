import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  inject,
  isDevMode,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { DEFAULT_PLAYER_COUNT, PLAYER_COLOR_LIST } from '@core/injection-tokens';
import { playerColorList } from '@player/player-color-list';
import { registerIcons } from './core/icon-library';
import { onRouteViewTransition } from '@core/animations/route-transition';
import { ThemeService } from '@core/theme.service';
import { GAME_TYPE } from '@game/game-type';
import { perRoundGameType } from '@game-types/per-round-scoring/per-round-game-type';
import { freeFormGameType } from '@game-types/free-form-scoring/free-form-game-type';
import { endGameGameType } from '@game-types/end-game-scoring/end-game-game-type';
import { BUILT_IN_SCORING_CONFIG } from '@game-types/end-game-scoring/scoring-config.store';
import {
  terraformingMarsConfig,
  thatsSoCleverConfig,
} from '@game-types/end-game-scoring/data/built-in-configs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(() => registerIcons(inject(FaIconLibrary))),
    provideAppInitializer(() => inject(ThemeService).initialize()),
    provideCharts(withDefaultRegisterables()),
    provideRouter(routes, withViewTransitions({ onViewTransitionCreated: onRouteViewTransition })),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    { provide: DEFAULT_PLAYER_COUNT, useValue: 2 },
    { provide: PLAYER_COLOR_LIST, useValue: playerColorList },
    // Registered game types. Add a type here (+ its descriptor/component) — the registry,
    // Home cards, routing, and persistence pick it up with no further core changes.
    { provide: GAME_TYPE, useValue: perRoundGameType, multi: true },
    { provide: GAME_TYPE, useValue: freeFormGameType, multi: true },
    { provide: GAME_TYPE, useValue: endGameGameType, multi: true },
    // Built-in end-game scoring configs. Add one here (+ its descriptor in built-in-configs.ts)
    // and the setup screen's rule-set dropdown lists it alongside the user's saved configs.
    { provide: BUILT_IN_SCORING_CONFIG, useValue: terraformingMarsConfig, multi: true },
    { provide: BUILT_IN_SCORING_CONFIG, useValue: thatsSoCleverConfig, multi: true },
  ],
};
