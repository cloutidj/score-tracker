import { AfterViewInit, Component, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { ModalService } from './modal.service';

@Component({
  selector: 'st-modal-container',
  template: `<ng-template #modal></ng-template>`,
})
export class ModalContainerComponent implements AfterViewInit {
  @ViewChild('modal', { read: ViewContainerRef, static: true }) modal!: ViewContainerRef;

  private modalService = inject(ModalService);

  ngAfterViewInit(): void {
    this.modalService.initialize(this.modal);
  }
}
