/**
 * Setup config for a health-points game: the life total every player starts at (e.g. 50 for
 * Star Realms, 20/40 for Magic). Chosen on the setup screen and handed to
 * {@link HealthPointsService.startGame} as the type's `TConfig`.
 */
export interface HealthPointsConfig {
  startingLife: number;
}
