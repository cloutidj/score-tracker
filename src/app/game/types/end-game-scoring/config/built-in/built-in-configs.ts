import { ScoringConfig } from '../../_shared/models/scoring-config';
import { terraformingMarsConfig } from './terraforming-mars.config';
import { CleverCubedConfig } from './clever-cubed.config';
import { Clever4EverConfig } from './clever-4-ever.config';
import { twiceAsCleverConfig } from './twice-as-clever.config';
import { thatsPrettyCleverConfig } from './thats-so-clever.config';

/**
 * All code-provided starting configs. Between them they exercise every rule kind in the
 * catalog, which is the point: they're the working proof the engine covers real games, not
 * just toy cases. Lookup-table point values are sensible starting defaults the user can tweak
 * via the in-app builder.
 */
export const builtInScoringConfigs: ScoringConfig[] = [terraformingMarsConfig, thatsPrettyCleverConfig, twiceAsCleverConfig, Clever4EverConfig, CleverCubedConfig];
