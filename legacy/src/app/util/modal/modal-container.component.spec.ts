import { TestBed } from '@angular/core/testing';
import { ModalContainerComponent } from '@util/modal/modal-container.component';
import { ModalService } from '@util/modal/modal.service';

describe('ModalContainerComponent', () => {
  const modalService = jasmine.createSpyObj('ModalService', [ 'initialize' ]);
  const initSpy = modalService.initialize.and.returnValue();

  beforeEach(() => {
    const fixture = TestBed.configureTestingModule({
      declarations: [ ModalContainerComponent ],
      providers: [ { provide: ModalService, useValue: modalService } ]
    }).createComponent(ModalContainerComponent);

    fixture.detectChanges();
  });

  it('should call initialize on the modal service', () => {
    expect(initSpy.calls.any()).toBe(true);
  });
});
