import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ClrIcon } from '@clr/angular';
import { Player } from '@models/player';
import { ModalService } from '@util/modal/modal.service';
import { NumberModalComponent, NumberModalData } from '@util/number-modal/number-modal.component';

@Component({
  selector: 'st-number-pad',
  imports: [NgClass, ClrIcon],
  templateUrl: './number-pad.component.html',
  styleUrl: './number-pad.component.scss',
})
export class NumberPadComponent {
  @Input() player?: Player;
  @Output() score = new EventEmitter<number>();

  readonly buttonValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  private modalService = inject(ModalService);

  selectCustomVal(): void {
    const modalData: NumberModalData = {
      title: 'Enter Score',
    };
    this.modalService.createModalOfType(NumberModalComponent, modalData).result.then(
      (val) => this.score.emit(val),
      () => {
        /* modal dismissed */
      },
    );
  }

  getButtonClass(val: number): string {
    return `score-button-${val}`;
  }
}
