import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClarityModule, ClrForm } from '@clr/angular';
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormDirective } from '@forms/directives/form.directive';

@Component({
  template: `
      <form clrForm [formGroup]="formGroup"></form>`
})
export class TestFormComponent {
  @ViewChild(ClrForm, { static: true }) clrForm: ClrForm;
  @ViewChild(FormDirective, { static: true }) formDirective: FormDirective;
  formGroup: FormGroup = new FormGroup({ test: new FormControl() });
}

describe('FormDirective', () => {
  let fixture: ComponentFixture<TestFormComponent>;
  let component: TestFormComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ FormDirective, TestFormComponent ],
      imports: [ ReactiveFormsModule, ClarityModule ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestFormComponent);
    component = fixture.debugElement.componentInstance;

    fixture.detectChanges();
  });

  it('should create the directive', () => {
    expect(component.formDirective).toBeTruthy();
  });

  it('should call the clarity markAsTouched', (done: DoneFn) => {
    const clrSpy = spyOn(component.clrForm, 'markAsTouched');
    component.formDirective.touchEvent().subscribe(() => done());

    component.formDirective.markAsTouched();
    expect(clrSpy).toHaveBeenCalled();
  });
});
