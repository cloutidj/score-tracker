import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  inject,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { DEFAULT_PLAYER_COUNT, PLAYER_COLOR_LIST } from '@util/injection-tokens';
import { playerColorList } from './data/player-color-list';
import { registerIcons } from './icons/icon-library';
import { ThemeService } from '@util/theme.service';
import { GAME_TYPE } from '@game/game-type';
import { perRoundGameType } from './per-round-scoring/per-round-game-type';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(() => registerIcons(inject(FaIconLibrary))),
    provideAppInitializer(() => inject(ThemeService).initialize()),
    provideAnimationsAsync(),
    provideCharts(withDefaultRegisterables()),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    { provide: DEFAULT_PLAYER_COUNT, useValue: 2 },
    { provide: PLAYER_COLOR_LIST, useValue: playerColorList },
    // Registered game types. Add a type here (+ its descriptor/component) — the registry,
    // Home cards, routing, and persistence pick it up with no further core changes.
    { provide: GAME_TYPE, useValue: perRoundGameType, multi: true },
  ],
};
