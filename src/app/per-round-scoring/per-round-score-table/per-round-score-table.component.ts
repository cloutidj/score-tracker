import { Component } from '@angular/core';
import { ModalService } from '@util/modal/modal.service';
import { Player } from '@models/player';
import { NumberModalComponent, NumberModalData } from '@util/number-modal/number-modal.component';
import { PerRoundScoringService } from '../providers/per-round-scoring.service';
import { GameRound } from '../models/game-round';

const ROUND_CUTOFF = 10;

@Component({
  selector: 'st-per-round-score-table',
  templateUrl: './per-round-score-table.component.html',
  styleUrls: [ './per-round-score-table.component.scss' ]
})
export class PerRoundScoreTableComponent {
  public showAllRounds = false;

  constructor(public gameService: PerRoundScoringService, private modalService: ModalService) {}

  trimmedTable(): boolean {
    return this.gameService.roundList().length > ROUND_CUTOFF;
  }

  showRound(roundIndex: number): boolean {
    return this.showAllRounds || roundIndex >= (this.gameService.roundList().length - ROUND_CUTOFF);
  }

  editScore(player: Player, round: GameRound): void {
    const modalData: NumberModalData = {
      title: `Edit Score for ${player.name} - ${round.label}`
    };
    this.modalService.createModalOfType(NumberModalComponent, modalData).result.then(
      val => this.gameService.modifyScore(player, round.roundId, val),
      () => {}
    );
  }
}
