import { PlayerBase } from '@models/player-base';
import { PlayerColor } from '@models/player-color';
import { Component, Input } from '@angular/core';
import { ClrDatagridFilterInterface } from '@clr/angular';
import { Subject, Observable } from 'rxjs';

@Component({
  selector: 'st-color-filter',
  template: `
        <st-color-swatch *ngFor="let color of colors"
            style="margin: .25rem;"
            (click)="toggleColor(color)"
            [color]="color"
            [clickable]="true"
            [active]="colorIsSelected(color)"></st-color-swatch>`,
})
export class ColorFilterComponent implements ClrDatagridFilterInterface<PlayerBase> {
  @Input() colors: PlayerColor[];
  selectedColors: string[] = [];

  private _changes = new Subject<any>();
  public get changes(): Observable<any> {
    return this._changes.asObservable();
  }

  public colorIsSelected(color: PlayerColor): boolean {
    return this.selectedColors.findIndex(c => c === color.hexString()) >= 0;
  }

  toggleColor(color: PlayerColor) {
    const isFound = this.colorIsSelected(color);
    if (isFound) {
      this.selectedColors.splice(this.selectedColors.indexOf(color.hexString()), 1);
    } else {
      this.selectedColors.push(color.hexString());
    }

    this._changes.next(true);
  }

  isActive(): boolean {
    return this.selectedColors.length > 0;
  }

  accepts(player: PlayerBase) {
    return this.colorIsSelected(player.color);
  }
}
