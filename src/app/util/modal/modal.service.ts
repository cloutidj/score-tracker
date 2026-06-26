import { ComponentRef, Injectable, Type, ViewContainerRef } from '@angular/core';
import { ModalComponentInterface } from './modal-component.interface';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private viewContainerRef?: ViewContainerRef;

  initialize(vc: ViewContainerRef): void {
    this.viewContainerRef = vc;
  }

  createModalOfType<T extends ModalComponentInterface>(modalComponent: Type<T>, data?: unknown): T {
    if (!this.viewContainerRef) {
      throw new Error('ModalService not initialized — render <st-modal-container> in the app shell first.');
    }

    this.viewContainerRef.clear();

    const modalComponentRef: ComponentRef<T> = this.viewContainerRef.createComponent(modalComponent);
    const modalInstance = modalComponentRef.instance;

    modalInstance.result.then(
      () => modalComponentRef.destroy(),
      () => modalComponentRef.destroy(),
    );

    if (data != null) {
      (modalInstance as ModalComponentInterface).data = data;
    }

    return modalInstance;
  }
}
