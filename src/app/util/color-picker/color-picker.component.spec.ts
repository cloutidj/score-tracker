import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClarityModule } from '@clr/angular';
import { ColorPickerComponent } from './color-picker.component';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { playerColorList } from '../../data/player-color-list';
import { PLAYER_COLOR_LIST } from '@util/injection-tokens';

@Component({
  template: `
      <form [formGroup]="testForm">
          <st-color-picker formControlName="val"></st-color-picker>
      </form>`
})
export class TestFormComponent implements OnInit {
  testForm: FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.testForm = this.formBuilder.group({
      val: playerColorList[ 2 ]
    });
  }
}

describe('ColorPickerComponent', () => {
  let fixture: ComponentFixture<TestFormComponent>;
  let component: TestFormComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ColorPickerComponent, TestFormComponent ],
      imports: [ ReactiveFormsModule, ClarityModule ],
      providers: [
        { provide: PLAYER_COLOR_LIST, useValue: playerColorList }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestFormComponent);
    component = fixture.debugElement.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should default the value', () => {
    expect(fixture.debugElement.queryAll(By.css('.color-swatch'))[ 2 ].classes.active).toBeTruthy();
  });

  it('should change the value on click', () => {
    const buttonElements = fixture.debugElement.queryAll(By.css('.color-swatch'));
    buttonElements[ 5 ].triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.testForm.value.val).toEqual(playerColorList[ 5 ]);
    expect(fixture.debugElement.queryAll(By.css('.color-swatch'))[ 5 ].classes.active).toBeTruthy();
  });
});
