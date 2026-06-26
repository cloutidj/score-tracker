import { Component, input, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { ClrDatagridFilterInterface } from '@clr/angular';
import { PlayerBase } from '@models/player-base';
import { PlayerColor } from '@models/player-color';
import { ColorSwatchComponent } from '../color-swatch/color-swatch.component';

@Component({
  selector: 'st-color-filter',
  imports: [ColorSwatchComponent],
  template: `
    @for (color of colors(); track color.hexString()) {
      <st-color-swatch
        style="margin: .25rem;"
        [color]="color"
        [clickable]="true"
        [active]="colorIsSelected(color)"
        (click)="toggleColor(color)"
      ></st-color-swatch>
    }
  `,
})
export class ColorFilterComponent implements ClrDatagridFilterInterface<PlayerBase> {
  readonly colors = input<PlayerColor[]>([]);
  readonly selectedColors = signal<string[]>([]);

  // Clarity's datagrid subscribes to `changes` to re-run the filter.
  readonly changes = new Subject<boolean>();

  colorIsSelected(color: PlayerColor): boolean {
    return this.selectedColors().includes(color.hexString());
  }

  toggleColor(color: PlayerColor): void {
    const hex = color.hexString();
    this.selectedColors.update((selected) =>
      selected.includes(hex) ? selected.filter((c) => c !== hex) : [...selected, hex],
    );
    this.changes.next(true);
  }

  isActive(): boolean {
    return this.selectedColors().length > 0;
  }

  accepts(player: PlayerBase): boolean {
    return this.colorIsSelected(player.color);
  }
}
