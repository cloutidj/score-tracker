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
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Player } from '@player/models/player';
import { PlayerColor } from '@player/models/player-color';
import { PlayerPreference } from '@player/models/player-preference';
import { SavedPlayerService } from '@player/saved-player.service';
import { ColorPickerComponent } from '@player/colors/color-picker/color-picker.component';

/** Identity entry mode: type a name, or import one from a saved player. */
type IdentityMode = 'manual' | 'import';

@Component({
  selector: 'st-player-info',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FontAwesomeModule,
    ColorPickerComponent,
  ],
  templateUrl: './player-info.component.html',
  styleUrl: './player-info.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PlayerInfoComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => PlayerInfoComponent), multi: true },
  ],
})
export class PlayerInfoComponent implements ControlValueAccessor, Validator {
  readonly playerInfo = input<Player>();
  /** When true, expose the manual/import toggle (game setup); off for saved-player editing. */
  readonly allowImport = input(false);

  protected readonly savedPlayerService = inject(SavedPlayerService);

  private readonly fb = inject(NonNullableFormBuilder);
  readonly playerInfoForm = this.fb.group({
    name: this.fb.control('', Validators.required),
    color: this.fb.control<PlayerColor | null>(null, Validators.required),
  });

  protected readonly mode = signal<IdentityMode>('manual');

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
    this.playerInfoForm.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.onChangeFn({ ...this.playerInfo(), ...value } as Player);
    });
  }

  /** Toggle between typing a name and picking a saved player. */
  toggleMode(): void {
    this.mode.set(this.mode() === 'manual' ? 'import' : 'manual');
  }

  /**
   * Fill the form from a saved player and drop back to manual mode so the name is
   * visible/editable and the color stays adjustable (e.g. to resolve a conflict).
   */
  importPlayer(saved: PlayerPreference): void {
    if (!saved) {
      return;
    }
    this.playerInfoForm.patchValue({ name: saved.name, color: saved.color });
    this.mode.set('manual');
  }

  /**
   * Reveal validation on every field. Called by the parent form's submit handler:
   * the inner reactive form lives inside this CVA, so the parent's
   * `markAllAsTouched()` can't reach it. Marking the controls drives the name
   * `mat-error`; the color signal drives the custom color-picker error.
   */
  markAllAsTouched(): void {
    this.colorTouched.set(true);
    this.playerInfoForm.markAllAsTouched();
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
