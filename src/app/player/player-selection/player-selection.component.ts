import { Component, inject, output, signal, viewChildren } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
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
import { Player } from '@player/models/player';
import { PlayerColor } from '@player/models/player-color';
import { DEFAULT_PLAYER_COUNT } from '@core/injection-tokens';
import { NumberPickerComponent } from '@ui/number-picker/number-picker.component';
import { PlayerColorDirective } from '@player/colors/player-color.directive';
import { PlayerInfoComponent } from '@player/player-info/player-info.component';

/**
 * Compare two player colors by value, not reference: imported colors are
 * rehydrated into fresh `PlayerColor` instances (see `SavedPlayerService.load`),
 * so identity (`===`) would miss a duplicate between an imported and a picked
 * color. The RGB triple is the value identity.
 */
function sameColor(a?: PlayerColor, b?: PlayerColor): boolean {
  return !!a && !!b && a.red === b.red && a.green === b.green && a.blue === b.blue;
}

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
        if (value?.color && sameColor(other.value?.color, value.color)) {
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
    NumberPickerComponent,
    PlayerColorDirective,
    PlayerInfoComponent,
  ],
  templateUrl: './player-selection.component.html',
  styleUrl: './player-selection.component.scss',
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

  // Per-row player color, kept as a signal so the full-row theming re-renders on
  // every inline color change under zoneless change detection (a bare template
  // read of the form value would not).
  readonly rowColors = toSignal(
    this.playersFormArray.valueChanges.pipe(
      // `color` is typed as always-present but is unset on a fresh player, so
      // coalesce to null for the not-yet-chosen rows.
      map((players): (PlayerColor | null)[] => players.map((player) => player?.color ?? null)),
    ),
    { initialValue: [] as (PlayerColor | null)[] },
  );

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
