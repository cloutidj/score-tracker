import { ModalComponentInterface } from '@util/modal/modal-component.interface';
import { ModalService } from '@util/modal/modal.service';

describe('ModalService', () => {
  const viewContainerRef = jasmine.createSpyObj('ViewContainerRef', [ 'clear', 'createComponent' ]);
  viewContainerRef.test = 1;
  const clearSpy = viewContainerRef.clear.and.returnValue();
  const componentFactoryResolver = jasmine.createSpyObj('ComponentFactoryResolver', [ 'resolveComponentFactory' ]);
  const resolveComponentFactorySpy = componentFactoryResolver.resolveComponentFactory.and.returnValue();
  let resolveFn;
  let rejectFn;
  const modalInstance: ModalComponentInterface = { result: null };
  const modalComponentRef = jasmine.createSpyObj('ModalComponentRef', [ 'destroy' ]);
  modalComponentRef.instance = modalInstance;
  const destroySpy = modalComponentRef.destroy.and.returnValue();
  viewContainerRef.createComponent.and.returnValue(modalComponentRef);
  let modalService: ModalService;

  beforeEach(() => {
    modalInstance.result = new Promise<any>((resolve, reject) => {
      resolveFn = resolve;
      rejectFn = reject;
    });
    modalService = new ModalService();
    modalService.initialize(viewContainerRef, componentFactoryResolver);
    destroySpy.calls.reset();
  });

  it('should clear the viewContainerRef when creating a modal', () => {
    modalService.createModalOfType('test');
    expect(clearSpy).toHaveBeenCalled();
  });

  it('should create a modal of the provided type', () => {
    const result = modalService.createModalOfType('test');
    expect(result).toBeTruthy();
    expect(resolveComponentFactorySpy).toHaveBeenCalledWith('test');
  });

  it('should call destroy on result resolve', () => {
    modalService.createModalOfType('test');
    resolveFn();
    modalInstance.result.then(() => { expect(destroySpy).toHaveBeenCalled(); });
  });

  it('should call destroy on result reject', () => {
    modalService.createModalOfType('test');
    rejectFn();
    modalInstance.result.then(() => { }, () => {
      expect(destroySpy).toHaveBeenCalled();
    });
  });

  it('should pass data if it is provided', () => {
    const result = modalService.createModalOfType('test', 'dummy');
    expect(result.data).toEqual('dummy');
  });
});
