/**
 * Contextual surfaces that overlay the main content area. Driven by the bottom
 * nav's 4 buttons (`home`, `styles`, `players`, `ruleSets`). Grows as features
 * contribute panels; if it gets large, consider a registry (mirroring
 * `GAME_TYPE`) so a feature can add a panel without editing here.
 */
export type PanelId = 'home' | 'styles' | 'players' | 'ruleSets';
