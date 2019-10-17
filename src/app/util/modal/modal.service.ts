import { ComponentFactoryResolver, ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { ModalComponentInterface } from './modal-component.interface';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private viewContainerRef: ViewContainerRef;
  private componentFactoryResolver: ComponentFactoryResolver;

  public initialize(vc: ViewContainerRef, cfr: ComponentFactoryResolver) {
    this.viewContainerRef = vc;
    this.componentFactoryResolver = cfr;
  }

  private createModalInstance(modalComponent: any): ComponentRef<any> {
    this.viewContainerRef.clear();

    const modalComponentFactory = this.componentFactoryResolver.resolveComponentFactory(modalComponent);
    const modalComponentRef = this.viewContainerRef.createComponent(modalComponentFactory);
    const modalInstance = modalComponentRef.instance as ModalComponentInterface;
    modalInstance.result.then(
      () => modalComponentRef.destroy(),
      () => modalComponentRef.destroy()
    );
    return modalComponentRef;
  }

  public createModalOfType(modalComponent: any, data: any = null): ModalComponentInterface {
    const ref = this.createModalInstance(modalComponent);
    if (data) { ref.instance.data = data; }
    return ref.instance;
  }
}
