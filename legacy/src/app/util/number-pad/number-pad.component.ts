import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Player } from '@models/player';
import { ModalService } from '@util/modal/modal.service';
import { NumberModalComponent, NumberModalData } from '@util/number-modal/number-modal.component';

@Component({
  selector: 'st-number-pad',
  templateUrl: './number-pad.component.html',
  styleUrls: [ './number-pad.component.scss' ]
})
export class NumberPadComponent {
  @Input() player: Player;
  @Output() score = new EventEmitter<number>();

  public buttonValues = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 0 ];

  constructor(private modalService: ModalService) {}

  public selectCustomVal(): void {
    const modalData: NumberModalData = {
      title: 'Enter Score'
    };
    this.modalService.createModalOfType(NumberModalComponent, modalData).result.then(
      val => this.score.emit(val),
      () => {});
  }

  public getButtonClass(val: number) {
    return `score-button-${val}`;
  }
}
