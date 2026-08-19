import { InjectionToken } from '@angular/core';
import { ScoringConfig } from '@game-types/end-game-scoring/_shared/models/scoring-config';
import { builtInScoringConfigs } from './built-in-configs';

/**
 * Multi-provider token holding the code-provided built-in configs (one per file in this
 * folder). Mirrors the `GAME_TYPE` convention: register a built-in in `app.config.ts` without
 * touching {@link import('../scoring-config.store').ScoringConfigStore}, which injects this
 * token and merges the built-ins with the user's saved configs.
 */
export const BUILT_IN_SCORING_CONFIG = new InjectionToken<ScoringConfig[]>('BUILT_IN_SCORING_CONFIG');

/** Provider entries registering every {@link builtInScoringConfigs} entry under {@link BUILT_IN_SCORING_CONFIG}. */
export function provideBuiltInScoringConfigs(): { provide: InjectionToken<ScoringConfig[]>; useValue: ScoringConfig; multi: true }[] {
  return builtInScoringConfigs.map((config) => ({
    provide: BUILT_IN_SCORING_CONFIG,
    useValue: config,
    multi: true,
  }));
}
