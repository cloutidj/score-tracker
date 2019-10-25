import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClarityModule } from '@clr/angular';
import { NumberPickerComponent } from './number-picker.component';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

@Component({
  template: `
      <form [formGroup]="testForm">
          <st-number-picker formControlName="val"></st-number-picker>
      </form>`
})
export class TestFormComponent implements OnInit {
  testForm: FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.testForm = this.formBuilder.group({
      val: 4
    });
  }
}

describe('NumberPickerComponent', () => {
  let fixture: ComponentFixture<TestFormComponent>;
  let component: TestFormComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ NumberPickerComponent, TestFormComponent ],
      imports: [ ReactiveFormsModule, ClarityModule ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestFormComponent);
    component = fixture.debugElement.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should default the value', () => {
    expect(fixture.debugElement.query(By.css('.number-display')).nativeElement.innerText).toEqual('4');
  });

  it('should increment the value', () => {
    const buttonElements = fixture.debugElement.queryAll(By.css('button'));
    buttonElements[ 0 ].triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.testForm.value.val).toEqual(5);
    expect(fixture.debugElement.query(By.css('.number-display')).nativeElement.innerText).toEqual('5');
  });

  it('should decrement the value', () => {
    const buttonElements = fixture.debugElement.queryAll(By.css('button'));
    buttonElements[ 1 ].triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.testForm.value.val).toEqual(3);
    expect(fixture.debugElement.query(By.css('.number-display')).nativeElement.innerText).toEqual('3');
  });
});
