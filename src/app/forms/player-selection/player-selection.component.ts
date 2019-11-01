import { ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { Player } from '@models/player';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DEFAULT_PLAYER_COUNT } from '@util/injection-tokens';
import { transition, trigger } from '@angular/animations';
import { fadeInDown, fadeOutUp } from '@util/animations/in-out.animations';

@Component({
  selector: 'st-player-selection',
  templateUrl: './player-selection.component.html',
  styleUrls: [ './player-selection.component.scss' ],
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
      players: this.formBuilder.array([], Validators.required)
    });

    this.playersFormArray = this.playerInfoForm.get('players') as FormArray;

    this.playerCountForm.valueChanges.subscribe(val => {
      this.setPlayers(val.playerCount);
    });

    this.playerCountForm.setValue({ playerCount: this.defaultPlayerCount });
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
}
