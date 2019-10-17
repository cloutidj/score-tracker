import { Component, forwardRef, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormGroup, NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  Validators
} from '@angular/forms';
import { Player } from '@models/player';

@Component({
  selector: 'st-player-info',
  templateUrl: './player-info.component.html',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PlayerInfoComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => PlayerInfoComponent), multi: true }
  ]
})
export class PlayerInfoComponent implements OnInit, ControlValueAccessor, Validator {
  @Input() playerInfo: Player;
  playerInfoForm: FormGroup;

  public onChange;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.playerInfoForm = this.formBuilder.group({
      name: [ '', Validators.required ]
    });

    this.playerInfoForm.valueChanges.subscribe(v => this.onChange(Object.assign(this.playerInfo, v)));
  }

  writeValue(obj: any): void {
    if (obj === null) {
      Object.keys(this.playerInfoForm.controls).forEach(c => this.playerInfoForm.controls[ c ].reset());
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
