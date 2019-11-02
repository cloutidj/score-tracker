import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PlayerInfoComponent } from './player-info.component';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { By } from '@angular/platform-browser';
import { UtilModule } from '@util/util.module';
import { FormDirective } from '@forms/directives/form.directive';
import { Subject } from 'rxjs';
import { PlayerColor } from '@models/player-color';
import { PLAYER_COLOR_LIST } from '@util/injection-tokens';
import { ColorPickerComponent } from '@util/color-picker/color-picker.component';

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
      player: [ { name: 'Frank', color: new PlayerColor(9, 9, 9) } ]
    });
  }
}

describe('PlayerInfoComponent', () => {
  let fixture: ComponentFixture<TestFormComponent>;
  let component: TestFormComponent;
  let formDirective: jasmine.SpyObj<FormDirective>;
  let touchObservable: Subject<void>;

  const colors = [
    new PlayerColor(0, 0, 0),
    new PlayerColor(1, 2, 3),
    new PlayerColor(5, 5, 5)
  ];

  const testFormData = {
    name: 'Timmy',
    color: colors[ 1 ]
  };

  beforeEach(() => {
    formDirective = jasmine.createSpyObj('FormDirective', [ 'touchEvent' ]);
    touchObservable = new Subject<void>();
    formDirective.touchEvent.and.returnValue(touchObservable);

    TestBed.configureTestingModule({
      declarations: [ PlayerInfoComponent, TestFormComponent ],
      imports: [ ReactiveFormsModule, ClarityModule, UtilModule ],
      providers: [
        { provide: FormDirective, useValue: formDirective },
        { provide: PLAYER_COLOR_LIST, useValue: colors }
      ]
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

    const colorInput = fixture.debugElement.query(By.directive(ColorPickerComponent)).componentInstance;
    expect(colorInput.selectedColor).toEqual(new PlayerColor(9, 9, 9));
  });

  it('should set form data', () => {
    component.testFormGroup.setValue({
      player: testFormData,
    });

    const nameInput = fixture.debugElement.query(By.css('input[formControlName="name"]')).nativeElement;
    expect(nameInput.value).toEqual(testFormData.name);
    const colorInput = fixture.debugElement.query(By.directive(ColorPickerComponent)).componentInstance;
    expect(colorInput.selectedColor).toEqual(testFormData.color);
    expect(component.testFormGroup.valid).toEqual(true);
  });

  it('should clear the form', () => {
    component.testFormGroup.controls.player.reset();
    expect(component.testFormGroup.value).toEqual({ player: { name: null, color: null } });
  });

  it('should be invalid without a name', () => {
    component.testFormGroup.setValue({ player: { name: null } });
    expect(component.testFormGroup.valid).toEqual(false);
  });

  it('should be invalid without a color', () => {
    component.testFormGroup.setValue({ player: { color: null } });
    expect(component.testFormGroup.valid).toEqual(false);
  });

  it('should show color picker error', fakeAsync(() => {
    component.testFormGroup.setValue({ player: { color: null } });
    touchObservable.next();
    tick();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('span.clr-subtext'))).toBeTruthy();
  }));
});
