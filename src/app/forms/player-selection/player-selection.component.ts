import { ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { Player } from '@models/player';
import { FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { DEFAULT_PLAYER_COUNT } from '@util/injection-tokens';
import { transition, trigger } from '@angular/animations';
import { fadeInDown, fadeOutUp } from '@util/animations/in-out.animations';
import { FormDirective } from '@forms/directives/form.directive';

@Component({
  selector: 'st-player-selection',
  templateUrl: './player-selection.component.html',
  styleUrls: [ './player-selection.component.scss' ],
  providers: [ FormDirective ],
  animations: [
    trigger('inOutAnimation', [
        transition(':enter', fadeInDown),
        transition(':leave', fadeOutUp)
      ]
    )
  ]
})
export class PlayerSelectionComponent implements OnInit {
  @Output() selectPlayers = new EventEmitter<Player[]>();

  @ViewChild(FormDirective, { static: true }) formDirective: FormDirective;

  public playerInfo: Player[];
  public playerInfoForm: FormGroup;
  public playersFormArray: FormArray;
  public playerCountForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    @Inject(DEFAULT_PLAYER_COUNT) private defaultPlayerCount: number,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.playerCountForm = this.formBuilder.group({
      playerCount: [ 0 ]
    });

    this.playerInfoForm = this.formBuilder.group({
      players: this.formBuilder.array([], [ Validators.required, this.uniquePlayerInfo ])
    });

    this.playersFormArray = this.playerInfoForm.get('players') as FormArray;

    this.playerCountForm.valueChanges.subscribe(val => {
      this.setPlayers(val.playerCount);
    });

    this.playerCountForm.setValue({ playerCount: this.defaultPlayerCount });
  }

  uniquePlayerInfo(formArray: FormArray): ValidationErrors {
    let error = {};
    formArray.controls.forEach(control => {
      const val = control.value;
      formArray.controls.filter(c => c.value !== control.value).forEach(oth => {
        if (val.name && oth.value && oth.value.name === val.name) {
          error = Object.assign(error, { duplicateName: 'All player names must be unique' });
        }

        if (val.color && oth.value.color === val.color) {
          error = Object.assign(error, { duplicateColor: 'All player colors must be unique' });
        }
      });
    });

    return error;
  }

  formErrors(): string[] {
    if (this.playersFormArray.errors) {
      return Object.keys(this.playersFormArray.errors).map(k => this.playersFormArray.errors[ k ]);
    }

    return [];
  }

  setPlayers(numPlayers: number): void {
    if (!this.playerInfo) {
      this.playerInfo = [];
    }

    if (numPlayers > this.playerInfo.length) {
      for (let i = this.playerInfo.length; i <= numPlayers; i++) {
        const player = new Player(i + 1);
        this.playerInfo.push(player);
        this.playersFormArray.push(this.formBuilder.control(player));
      }
    }

    if (numPlayers < this.playerInfo.length) {
      for (let i = numPlayers; i <= this.playerInfo.length; i++) {
        this.playerInfo.splice(i, 1);
        this.playersFormArray.removeAt(i);
      }
    }
    this.cdr.detectChanges();
  }

  public submitForm(): void {
    this.formDirective.markAsTouched();
    if (this.playerInfoForm.valid) {
      this.selectPlayers.emit(this.playersFormArray.value);
    }
  }
}
