import { Component, computed, forwardRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
  Validators,
} from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { Player } from '@models/player';
import { PlayerColor } from '@models/player-color';
import { ColorPickerComponent } from '@util/colors/color-picker/color-picker.component';
import { FormDirective } from '@forms/directives/form.directive';

@Component({
  selector: 'st-player-info',
  imports: [ReactiveFormsModule, ClarityModule, ColorPickerComponent],
  templateUrl: './player-info.component.html',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PlayerInfoComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => PlayerInfoComponent), multi: true },
  ],
})
export class PlayerInfoComponent implements ControlValueAccessor, Validator {
  readonly playerInfo = input<Player>();

  private readonly fb = inject(NonNullableFormBuilder);
  readonly playerInfoForm = this.fb.group({
    name: this.fb.control('', Validators.required),
    color: this.fb.control<PlayerColor | null>(null, Validators.required),
  });

  private readonly colorControl = this.playerInfoForm.controls.color;

  // Drive the color-picker error from signals so it re-renders under zoneless change detection
  // (marking a FormControl touched/invalid alone does not schedule change detection).
  private readonly colorTouched = signal(false);
  private readonly colorStatus = toSignal(this.colorControl.statusChanges, {
    initialValue: this.colorControl.status,
  });
  readonly showColorPickerError = computed(
    () => this.colorTouched() && this.colorStatus() === 'INVALID',
  );

  private onChangeFn: (val: Player) => void = () => {
    /* registered by registerOnChange */
  };

  constructor() {
    const formDirective = inject(FormDirective, { optional: true });

    this.playerInfoForm.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.onChangeFn({ ...this.playerInfo(), ...value } as Player);
    });

    formDirective
      ?.touchEvent()
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.colorTouched.set(true);
        this.colorControl.markAsTouched();
      });
  }

  writeValue(obj: Partial<Player> | null): void {
    if (obj === null) {
      this.playerInfoForm.reset();
    } else {
      this.playerInfoForm.patchValue(obj, { emitEvent: false });
    }
  }

  registerOnChange(fn: (val: Player) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(): void {
    /* no blur source to forward */
  }

  validate(): ValidationErrors | null {
    return this.playerInfoForm.valid ? null : { playerFormError: true };
  }
}
