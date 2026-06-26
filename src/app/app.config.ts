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

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { DEFAULT_PLAYER_COUNT, PLAYER_COLOR_LIST } from '@util/injection-tokens';
import { playerColorList } from './data/player-color-list';
import { IconService } from './icons/icon.service';
import { ThemeService } from '@util/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(() => inject(IconService).initialize()),
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
  ],
};
