import { StColor } from './st-color';

/**
 * Static helper for working with {@link StColor} values — construction, formatting, and
 * comparison. Grouping the pure color behavior on one class gives a single, discoverable
 * `ColorHelper.*` surface (rather than loose standalone functions) reusable across the app.
 */
export class ColorHelper {
  /** Build a color value (used by the canonical palette). */
  static create(red = 0, green = 0, blue = 0, name?: string): StColor {
    return { red, green, blue, name };
  }

  /** Human-readable label for a11y: the preset name, or the hex value for an unnamed color. */
  static label(c: StColor): string {
    return c.name || ColorHelper.hexString(c);
  }

  static rgbString(c: StColor, alpha = 1): string {
    return `rgb(${c.red}, ${c.green}, ${c.blue}, ${alpha})`;
  }

  static hexString(c: StColor): string {
    return `#${ColorHelper.numToHex(c.red)}${ColorHelper.numToHex(c.green)}${ColorHelper.numToHex(c.blue)}`;
  }

  /**
   * Base color value for the `--st-player-color` custom property. The hover/pressed palette is
   * derived from this in CSS via `color-mix()` — see `_player-color.scss`. The readable
   * on-color comes from {@link ColorHelper.contrastCssVarValue} (set on `--st-player-color-contrast`).
   */
  static cssVarValue(c: StColor): string {
    return `rgb(${c.red} ${c.green} ${c.blue})`;
  }

  /**
   * A readable text/icon color to place ON this color, for the `--st-player-color-contrast`
   * custom property. Picks black or white by WCAG relative luminance so light seeds (Yellow,
   * White) get dark text and dark seeds (Black, Blue) get light text — no per-color tuning.
   */
  static contrastCssVarValue(c: StColor): string {
    // 0.179 is the crossover where the contrast ratio against black equals the
    // ratio against white; above it, black text is more legible.
    return ColorHelper.relativeLuminance(c) > 0.179 ? 'rgb(0 0 0)' : 'rgb(255 255 255)';
  }

  /**
   * Compare two colors by value, not reference: an imported color and a picked color are
   * distinct objects, so identity (`===`) would miss a duplicate. The RGB triple is the
   * value identity.
   */
  static sameColor(a?: StColor, b?: StColor): boolean {
    return !!a && !!b && a.red === b.red && a.green === b.green && a.blue === b.blue;
  }

  private static relativeLuminance(c: StColor): number {
    const [r, g, b] = [c.red, c.green, c.blue].map((channel) => {
      const s = channel / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private static numToHex(num: number): string {
    const hex = num.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }
}
