import { Component, inject, output, signal, viewChildren } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { transition, trigger } from '@angular/animations';
import {
  FormArray,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Player } from '@models/player';
import { PlayerBase } from '@models/player-base';
import { DEFAULT_PLAYER_COUNT } from '@util/injection-tokens';
import { fadeInDown, fadeOutUp } from '@util/animations/in-out.animations';
import { NumberPickerComponent } from '@util/number-picker/number-picker.component';
import { PlayerInfoComponent } from '@forms/player-info/player-info.component';
import { SavedPlayerSelectComponent } from '@forms/saved-player-select/saved-player-select.component';

/** Cross-field rule: every player must have a unique name and a unique color. */
function uniquePlayerInfo(formArray: FormArray<FormControl<Player>>): ValidationErrors | null {
  const errors: ValidationErrors = {};

  formArray.controls.forEach((control) => {
    const value = control.value;
    formArray.controls
      .filter((other) => other.value !== value)
      .forEach((other) => {
        if (value?.name && other.value?.name === value.name) {
          errors['duplicateName'] = 'All player names must be unique';
        }
        if (value?.color && other.value?.color === value.color) {
          errors['duplicateColor'] = 'All player colors must be unique';
        }
      });
  });

  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'st-player-selection',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    FontAwesomeModule,
    NumberPickerComponent,
    PlayerInfoComponent,
    SavedPlayerSelectComponent,
  ],
  templateUrl: './player-selection.component.html',
  styleUrl: './player-selection.component.scss',
  animations: [
    trigger('inOutAnimation', [transition(':enter', fadeInDown), transition(':leave', fadeOutUp)]),
  ],
})
export class PlayerSelectionComponent {
  readonly selectPlayers = output<Player[]>();

  private readonly playerInfoComponents = viewChildren(PlayerInfoComponent);

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly defaultPlayerCount = inject(DEFAULT_PLAYER_COUNT);

  readonly playerInfo = signal<Player[]>([]);

  readonly playerCountForm = this.fb.group({
    playerCount: this.fb.control(this.defaultPlayerCount),
  });

  readonly playerInfoForm = this.fb.group({
    players: this.fb.array<FormControl<Player>>([], [Validators.required, uniquePlayerInfo]),
  });

  get playersFormArray(): FormArray<FormControl<Player>> {
    return this.playerInfoForm.controls.players;
  }

  constructor() {
    this.playerCountForm.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.setPlayers(value.playerCount ?? 0);
    });

    this.setPlayers(this.defaultPlayerCount);
  }

  formErrors(): string[] {
    const errors = this.playersFormArray.errors;
    return errors ? Object.values(errors).filter((e): e is string => typeof e === 'string') : [];
  }

  setPlayers(count: number): void {
    const current = this.playerInfo();

    if (count > current.length) {
      const additions: Player[] = [];
      for (let i = current.length; i < count; i++) {
        const player = new Player(i + 1);
        additions.push(player);
        this.playersFormArray.push(this.fb.control(player));
      }
      this.playerInfo.set([...current, ...additions]);
    } else if (count < current.length) {
      for (let i = current.length - 1; i >= count; i--) {
        this.playersFormArray.removeAt(i);
      }
      this.playerInfo.set(current.slice(0, count));
    }
  }

  populatePlayer(index: number, data: PlayerBase): void {
    if (data) {
      this.playersFormArray.at(index).patchValue(data as Player);
    }
  }

  submitForm(): void {
    // Each player-info wraps its own reactive form inside a CVA, so the parent
    // form's `markAllAsTouched()` can't reach those controls — mark each directly.
    this.playerInfoComponents().forEach((player) => player.markAllAsTouched());
    this.playerInfoForm.markAllAsTouched();
    if (this.playerInfoForm.valid) {
      this.selectPlayers.emit(this.playersFormArray.getRawValue());
    }
  }
}
