/**
 * Contextual surfaces that overlay the main content area (below the toolbar).
 * Grows as features contribute panels; if it gets large, consider a registry
 * (mirroring `GAME_TYPE`) so a feature can add a panel without editing here.
 */
export type PanelId = 'players' | 'ruleSets';
