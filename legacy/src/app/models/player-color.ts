export class PlayerColor {
  red: number;
  green: number;
  blue: number;

  rgbString(alpha: number = 1): string {
    return `rgb(${this.red}, ${this.green}, ${this.blue}, ${alpha})`;
  }

  hexString(): string {
    return `#${this.numToHex(this.red)}${this.numToHex(this.green)}${this.numToHex(this.blue)}`;
  }

  private numToHex(num) {
    const hex = num.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  constructor(r: number = 0, g: number = 0, b: number = 0) {
    this.red = r;
    this.green = g;
    this.blue = b;
  }
}
