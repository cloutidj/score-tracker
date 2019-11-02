export class PlayerColor {
  red: number;
  green: number;
  blue: number;

  rgbString(alpha: number = 1): string {
    return `rgb(${this.red}, ${this.green}, ${this.blue}, ${alpha})`;
  }

  constructor(r: number, g: number, b: number) {
    this.red = r;
    this.green = g;
    this.blue = b;
  }
}
