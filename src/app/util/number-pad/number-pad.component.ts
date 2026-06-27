import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Player } from '@models/player';
import { NumberDialogComponent, NumberDialogData } from '@util/number-dialog/number-dialog.component';

@Component({
  selector: 'st-number-pad',
  imports: [NgClass, FontAwesomeModule],
  templateUrl: './number-pad.component.html',
  styleUrl: './number-pad.component.scss',
})
export class NumberPadComponent {
  @Input() player?: Player;
  @Output() score = new EventEmitter<number>();

  readonly buttonValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  private dialog = inject(MatDialog);

  selectCustomVal(): void {
    const data: NumberDialogData = {
      title: 'Enter Score',
    };
    this.dialog
      .open(NumberDialogComponent, { data })
      .afterClosed()
      .subscribe((val) => {
        if (val != null) {
          this.score.emit(val);
        }
      });
  }

  getButtonClass(val: number): string {
    return `score-button-${val}`;
  }
}
