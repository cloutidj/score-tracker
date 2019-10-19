import { Component, Input } from '@angular/core';
import { PerRoundScoringGame } from '../models/per-round-scoring-game';
import { ModalService } from '@util/modal/modal.service';
import { Player } from '@models/player';
import { NumberModalComponent, NumberModalData } from '@util/number-modal/number-modal.component';

@Component({
  selector: 'st-per-round-score-table',
  templateUrl: './per-round-score-table.component.html',
  styleUrls: [ './per-round-score-table.component.scss' ]
})
export class PerRoundScoreTableComponent {
  @Input() game: PerRoundScoringGame;

  constructor(private modalService: ModalService) {}

  editScore(player: Player, round: number): void {
    const playerScores = this.game.scores.find(s => s.player === player).scores;
    const modalData: NumberModalData = {
      title: `Edit Score for ${player.name} - Round: ${round + 1}`
    };
    this.modalService.createModalOfType(NumberModalComponent, modalData).result.then(
      val => playerScores[ round ].score = val,
      () => {}
    );
  }
}
