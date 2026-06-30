/**
 * A player's color, as plain JSON-safe data. Behavior lives in the standalone functions
 * below rather than on the instance, so a color read back from storage (`JSON.parse`) is
 * already fully usable — no rehydration step, and the persisted shape *is* the runtime shape.
 */
export interface PlayerColor {
  red: number;
  green: number;
  blue: number;
  /** Optional label; the preset palette names its colors, but a custom color may have none. */
  name?: string;
}

/** Build a color value (used by the canonical palette). */
export function playerColor(red = 0, green = 0, blue = 0, name?: string): PlayerColor {
  return { red, green, blue, name };
}

/** Human-readable label for a11y: the preset name, or the hex value for an unnamed color. */
export function colorLabel(c: PlayerColor): string {
  return c.name || hexString(c);
}

export function rgbString(c: PlayerColor, alpha = 1): string {
  return `rgb(${c.red}, ${c.green}, ${c.blue}, ${alpha})`;
}

export function hexString(c: PlayerColor): string {
  return `#${numToHex(c.red)}${numToHex(c.green)}${numToHex(c.blue)}`;
}

/**
 * Base color value for the `--st-player` custom property. The hover/pressed palette is
 * derived from this in CSS via `color-mix()` — see `_player-colors.scss`. The readable
 * on-color comes from {@link contrastCssVarValue} (set on `--st-player-contrast`).
 */
export function cssVarValue(c: PlayerColor): string {
  return `rgb(${c.red} ${c.green} ${c.blue})`;
}

/**
 * A readable text/icon color to place ON this color, for the `--st-player-contrast`
 * custom property. Picks black or white by WCAG relative luminance so light seeds (Yellow,
 * White) get dark text and dark seeds (Black, Blue) get light text — no per-color tuning.
 */
export function contrastCssVarValue(c: PlayerColor): string {
  // 0.179 is the crossover where the contrast ratio against black equals the
  // ratio against white; above it, black text is more legible.
  return relativeLuminance(c) > 0.179 ? 'rgb(0 0 0)' : 'rgb(255 255 255)';
}

function relativeLuminance(c: PlayerColor): number {
  const [r, g, b] = [c.red, c.green, c.blue].map((channel) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function numToHex(num: number): string {
  const hex = num.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}
