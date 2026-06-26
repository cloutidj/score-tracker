import { AfterViewInit, Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';
import { ModalService } from './modal.service';

@Component({
  selector: 'st-modal-container',
  template: `
      <ng-template #modal></ng-template>`
})
export class ModalContainerComponent implements AfterViewInit {
  @ViewChild('modal', { read: ViewContainerRef, static: true }) modal: ViewContainerRef;

  constructor(private viewContainerRef: ViewContainerRef, private componentFactoryResolver: ComponentFactoryResolver,
              private modalService: ModalService) { }

  ngAfterViewInit() {
    this.modalService.initialize(this.modal, this.componentFactoryResolver);
  }
}
