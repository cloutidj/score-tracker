import { Component, forwardRef, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  Validators
} from '@angular/forms';
import { Player } from '@models/player';
import { UnsubscribeComponent } from '@util/base/unsubscribe.component';
import { takeUntil } from 'rxjs/operators';
import { FormDirective } from '@forms/directives/form.directive';

@Component({
  selector: 'st-player-info',
  templateUrl: './player-info.component.html',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PlayerInfoComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => PlayerInfoComponent), multi: true }
  ]
})
export class PlayerInfoComponent extends UnsubscribeComponent implements OnInit, ControlValueAccessor, Validator {
  @Input() playerInfo: Player;
  playerInfoForm: FormGroup;
  colorControl: FormControl;

  public onChange: (obj: any) => void;

  constructor(private formBuilder: FormBuilder, private formDirective: FormDirective) { super(); }

  ngOnInit() {
    this.playerInfoForm = this.formBuilder.group({
      name: ['', Validators.required],
      color: [null, Validators.required]
    });

    this.colorControl = this.playerInfoForm.get('color') as FormControl;

    this.playerInfoForm.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(v => {
        if (this.onChange) {
          this.onChange(Object.assign(this.playerInfo || {}, v));
        }
      });

    this.formDirective.touchEvent()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => this.colorControl.markAsTouched());
  }

  showColorPickerError(): boolean {
    return this.colorControl.invalid && this.colorControl.touched;
  }

  writeValue(obj: any): void {
    if (obj === null) {
      Object.keys(this.playerInfoForm.controls).forEach(c => this.playerInfoForm.controls[c].reset());
    } else {
      this.playerInfoForm.patchValue(obj, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.playerInfoForm.valid ? null : { playerFormError: true };
  }

}
