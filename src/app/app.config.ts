import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  inject,
  isDevMode,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideIcons, provideNgIconsConfig } from '@ng-icons/core';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { DEFAULT_PLAYER_COUNT } from '@core/injection-tokens/default-player-count';
import { COLOR_LIST, colorList } from '@color/color-list';
import { ICONS } from '@core/icon-library';
import { onRouteViewTransition } from '@core/animations/route-transition';
import { SkinService } from '@core/skin.service';
import { ThemeService } from '@core/theme.service';
import { GAME_TYPE } from '@game/game-type';
import { perRoundGameType } from '@game-types/per-round-scoring/per-round-game-type';
import { freeFormGameType } from '@game-types/free-form-scoring/free-form-game-type';
import { endGameGameType } from '@game-types/end-game-scoring/end-game-game-type';
import { healthPointsGameType } from '@game-types/health-points/health-points-game-type';
import { provideBuiltInScoringConfigs } from '@game-types/end-game-scoring/config/built-in/provide-built-in-scoring-configs';
import { PANEL } from '@core/panel/panel';
import { homePanel } from './shell/home-panel/home-panel';
import { stylesPanel } from './shell/styles-panel/styles-panel';
import { savedPlayersPanel } from '@player/saved-players/saved-players-panel';
import { ruleSetsPanel } from '@game-types/end-game-scoring/config/config-manager/rule-sets-panel';
import { calculatorPanel } from './shell/calculator-panel/calculator-panel';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideIcons(ICONS),
    provideNgIconsConfig({ size: '1em' }),
    provideAppInitializer(() => inject(ThemeService).initialize()),
    provideAppInitializer(() => inject(SkinService).initialize()),
    provideRouter(routes, withViewTransitions({ onViewTransitionCreated: onRouteViewTransition })),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    { provide: DEFAULT_PLAYER_COUNT, useValue: 2 },
    { provide: COLOR_LIST, useValue: colorList },
    // Registered game types. Add a type here (+ its descriptor/component) — the registry,
    // the Home panel's cards, routing, and persistence pick it up with no further core changes.
    { provide: GAME_TYPE, useValue: perRoundGameType, multi: true },
    { provide: GAME_TYPE, useValue: freeFormGameType, multi: true },
    { provide: GAME_TYPE, useValue: endGameGameType, multi: true },
    { provide: GAME_TYPE, useValue: healthPointsGameType, multi: true },
    provideBuiltInScoringConfigs(),
    // Registered panels, left to right on the bottom nav. Add a panel here (+ its
    // descriptor/component) — the registry, the bottom nav, and the panel host pick it up
    // with no further core changes.
    { provide: PANEL, useValue: homePanel, multi: true },
    { provide: PANEL, useValue: stylesPanel, multi: true },
    { provide: PANEL, useValue: savedPlayersPanel, multi: true },
    { provide: PANEL, useValue: ruleSetsPanel, multi: true },
    { provide: PANEL, useValue: calculatorPanel, multi: true },
  ],
};
