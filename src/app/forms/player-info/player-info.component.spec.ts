import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerInfoComponent } from './player-info.component';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { By } from '@angular/platform-browser';

@Component({
  template: `
      <form [formGroup]="testFormGroup">
          <st-player-info formControlName="player"></st-player-info>
      </form>`
})
export class TestFormComponent implements OnInit {
  testFormGroup: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.testFormGroup = this.formBuilder.group({
      player: [ { name: 'Frank' } ]
    });
  }
}

describe('PlayerInfoComponent', () => {
  let fixture: ComponentFixture<TestFormComponent>;
  let component: TestFormComponent;
  const testFormData = {
    name: 'Timmy'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerInfoComponent, TestFormComponent ],
      imports: [ ReactiveFormsModule, ClarityModule ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestFormComponent);
    component = fixture.debugElement.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form data', () => {
    const nameInput = fixture.debugElement.query(By.css('input[formControlName="name"]')).nativeElement;
    expect(nameInput.value).toEqual('Frank');
  });

  it('should set form data', () => {
    component.testFormGroup.setValue({
      player: testFormData
    });

    const nameInput = fixture.debugElement.query(By.css('input[formControlName="name"]')).nativeElement;
    expect(nameInput.value).toEqual(testFormData.name);
    expect(component.testFormGroup.valid).toEqual(true);
  });

  it('should be invalid without a name', () => {
    component.testFormGroup.setValue({ player: { name: null } });
    expect(component.testFormGroup.valid).toEqual(false);
  });
});
