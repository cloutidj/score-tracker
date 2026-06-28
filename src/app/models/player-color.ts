export class PlayerColor {
  constructor(
    public red = 0,
    public green = 0,
    public blue = 0,
    public name = '',
  ) {}

  rgbString(alpha = 1): string {
    return `rgb(${this.red}, ${this.green}, ${this.blue}, ${alpha})`;
  }

  hexString(): string {
    return `#${this.numToHex(this.red)}${this.numToHex(this.green)}${this.numToHex(this.blue)}`;
  }

  /**
   * Base color value for the `--st-player` custom property. The hover/pressed
   * palette is derived from this in CSS via `color-mix()` — see
   * `_player-colors.scss`. The readable on-color comes from
   * `contrastCssVarValue()` (set on `--st-player-contrast`).
   */
  cssVarValue(): string {
    return `rgb(${this.red} ${this.green} ${this.blue})`;
  }

  /**
   * A readable text/icon color to place ON this color, for the
   * `--st-player-contrast` custom property. Picks black or white by WCAG
   * relative luminance so light seeds (Yellow, White) get dark text and dark
   * seeds (Black, Blue) get light text — no per-color hand tuning needed.
   */
  contrastCssVarValue(): string {
    // 0.179 is the crossover where the contrast ratio against black equals the
    // ratio against white; above it, black text is more legible.
    return this.relativeLuminance() > 0.179 ? 'rgb(0 0 0)' : 'rgb(255 255 255)';
  }

  private relativeLuminance(): number {
    const [r, g, b] = [this.red, this.green, this.blue].map((channel) => {
      const s = channel / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private numToHex(num: number): string {
    const hex = num.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }
}
