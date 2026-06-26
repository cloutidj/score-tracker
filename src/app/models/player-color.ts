export class PlayerColor {
  constructor(
    public red = 0,
    public green = 0,
    public blue = 0,
  ) {}

  rgbString(alpha = 1): string {
    return `rgb(${this.red}, ${this.green}, ${this.blue}, ${alpha})`;
  }

  hexString(): string {
    return `#${this.numToHex(this.red)}${this.numToHex(this.green)}${this.numToHex(this.blue)}`;
  }

  private numToHex(num: number): string {
    const hex = num.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }
}
