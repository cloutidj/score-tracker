import { InjectionToken } from '@angular/core';
import { ScoringConfig } from '../../_shared/models/scoring-config';
import { terraformingMarsConfig } from './terraforming-mars.config';
import { CleverCubedConfig } from './clever-cubed.config';
import { Clever4EverConfig } from './clever-4-ever.config';
import { twiceAsCleverConfig } from './twice-as-clever.config';
import { thatsPrettyCleverConfig } from './thats-so-clever.config';

/**
 * Multi-provider token holding the code-provided built-in configs (one per file in this
 * folder). Mirrors the `GAME_TYPE` convention: register a built-in in `app.config.ts` without
 * touching {@link import('../scoring-config.store').ScoringConfigStore}, which injects this
 * token and merges the built-ins with the user's saved configs.
 */
export const BUILT_IN_SCORING_CONFIG = new InjectionToken<ScoringConfig[]>('BUILT_IN_SCORING_CONFIG');

/**
 * All code-provided starting configs. Between them they exercise every rule kind in the
 * catalog, which is the point: they're the working proof the engine covers real games, not
 * just toy cases. Lookup-table point values are sensible starting defaults the user can tweak
 * via the in-app builder.
 */
export const builtInScoringConfigs: ScoringConfig[] = [terraformingMarsConfig, thatsPrettyCleverConfig, twiceAsCleverConfig, Clever4EverConfig, CleverCubedConfig];

export function provideBuiltInScoringConfigs(): { provide: InjectionToken<ScoringConfig[]>; useValue: ScoringConfig; multi: true }[] {
  return builtInScoringConfigs.map((config) => ({
    provide: BUILT_IN_SCORING_CONFIG,
    useValue: config,
    multi: true,
  }));
}