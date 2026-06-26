import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NumberModalComponent } from './number-modal.component';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('NumberModalComponent', () => {
  let fixture: ComponentFixture<NumberModalComponent>;
  let component: NumberModalComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ NumberModalComponent ],
      imports: [ FormsModule, ClarityModule, NoopAnimationsModule ]
    }).compileComponents();

    fixture = TestBed.createComponent(NumberModalComponent);
    component = fixture.debugElement.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should open the modal on init', () => {
    const modalElement = fixture.debugElement.query(By.css('.modal'));
    expect(modalElement).toBeTruthy();
  });

  it('should reject and close the modal on cancel', (done: DoneFn) => {
    const cancelButton = fixture.debugElement.query(By.css('button.btn-outline'));
    component.result.then(
      () => fail('should not resolve'),
      () => { done(); }
    );

    cancelButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    const modalElement = fixture.debugElement.query(By.css('.modal'));
    expect(modalElement).toBeFalsy();
  });

  it('should resolve the value and close on submit', (done: DoneFn) => {
    const submitButton = fixture.debugElement.query(By.css('button.btn-primary'));
    component.result.then(
      val => {
        expect(val).toEqual(12);
        done();
      },
      () => fail('should not reject')
    );

    component.numberValue = 12;
    submitButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    const modalElement = fixture.debugElement.query(By.css('.modal'));
    expect(modalElement).toBeFalsy();
  });
});
