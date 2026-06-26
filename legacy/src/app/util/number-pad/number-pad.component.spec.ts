import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NumberPadComponent } from '@util/number-pad/number-pad.component';
import { ClarityModule } from '@clr/angular';
import { ModalService } from '@util/modal/modal.service';

describe('NumberPadComponent', () => {
  let fixture: ComponentFixture<NumberPadComponent>;
  let component: NumberPadComponent;
  let mockModal: jasmine.SpyObj<ModalService>;

  beforeEach(() => {
    mockModal = jasmine.createSpyObj('ModalService', [ 'createModalOfType' ]);

    TestBed.configureTestingModule({
      declarations: [ NumberPadComponent ],
      imports: [ ClarityModule ],
      providers: [
        { provide: ModalService, useValue: mockModal }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NumberPadComponent);
    component = fixture.debugElement.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  for (let i = 0; i <= 9; i++) {
    it(`should emit ${i} when clicking the button`, () => {
      const buttonEle = fixture.debugElement.query(By.css(`button.score-button-${i}`));
      component.score.subscribe(val => expect(val).toEqual(i));
      buttonEle.triggerEventHandler('click', null);
    });
  }

  it('should emit a custom number from the popup', (done: DoneFn) => {
    mockModal.createModalOfType.and.returnValue({ result: Promise.resolve(12) });

    component.score.subscribe(val => {
      expect(val).toEqual(12);
      done();
    });

    fixture.debugElement.query(By.css('button.custom-score-button')).triggerEventHandler('click', null);
  });

  it('should not emit a custom number from the popup when rejected', () => {
    mockModal.createModalOfType.and.returnValue({ result: Promise.reject(12) });

    component.score.subscribe(() => {
      fail('should not emit');
    });

    fixture.debugElement.query(By.css('button.custom-score-button')).triggerEventHandler('click', null);
  });
});
