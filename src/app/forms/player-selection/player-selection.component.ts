import { ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { Player } from '@models/player';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DEFAULT_PLAYER_COUNT } from '@util/injection-tokens';

@Component({
  selector: 'st-player-selection',
  templateUrl: './player-selection.component.html',
  styleUrls: [ './player-selection.component.scss' ]
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

  private static clearFormArray(formArray: FormArray): void {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  ngOnInit(): void {
    this.playerCountForm = this.formBuilder.group({
      playerCount: [ 0 ]
    });

    this.playerInfoForm = this.formBuilder.group({
      players: this.formBuilder.array([], Validators.required)
    });

    this.playersFormArray = this.playerInfoForm.get('players') as FormArray;

    this.playerCountForm.valueChanges.subscribe(val => {
      this.initializePlayers(val.playerCount);
    });

    this.playerCountForm.setValue({ playerCount: this.defaultPlayerCount });
  }

  initializePlayers(numPlayers: number): void {
    this.playerInfo = [];
    this.playerInfoForm.reset();
    PlayerSelectionComponent.clearFormArray(this.playersFormArray);

    for (let i = 1; i <= numPlayers; i++) {
      const player = new Player(i);
      this.playerInfo.push(player);
      this.playersFormArray.push(this.formBuilder.control(player));
    }

    this.cdr.detectChanges();
  }
}
