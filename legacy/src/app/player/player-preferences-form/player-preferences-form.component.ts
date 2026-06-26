import { PlayerPreference } from '@models/player-preference';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'st-player-preferences-form',
  templateUrl: './player-preferences-form.component.html'
})
export class PlayerPreferencesFormComponent implements OnInit {
  private _initData: PlayerPreference;
  @Input() set playerData(data: PlayerPreference) {
    this._initData = data;
    if (this.playerForm) {
      this.playerForm.patchValue({ player: data }, { emitEvent: false });
    }
  }

  @Output() save = new EventEmitter<PlayerPreference>();
  @Output() cancel = new EventEmitter<void>();

  public playerForm: FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.playerForm = this.formBuilder.group({
      player: this._initData
    });
  }

  saveClick(): void {
    if (this.playerForm.valid) {
      this.save.emit(this.playerForm.value.player);
    }
  }
}
