import { Component } from '@angular/core';
import { ModalService } from '@util/modal/modal.service';
import { Player } from '@models/player';
import { NumberModalComponent, NumberModalData } from '@util/number-modal/number-modal.component';
import { PerRoundScoringService } from '../per-round-scoring.service';

@Component({
  selector: 'st-per-round-score-table',
  templateUrl: './per-round-score-table.component.html',
  styleUrls: [ './per-round-score-table.component.scss' ]
})
export class PerRoundScoreTableComponent {
  public roundCutoff = 10;
  public showAllRounds = false;

  constructor(private gameService: PerRoundScoringService, private modalService: ModalService) {}

  trimmedTable(): boolean {
    return this.gameService.roundList.length > this.roundCutoff;
  }

  minRoundToShow(): number {
    return this.showAllRounds ? 0 : Math.max(this.gameService.roundList.length - this.roundCutoff, 0);
  }

  editScore(player: Player, round: number): void {
    const modalData: NumberModalData = {
      title: `Edit Score for ${player.name} - Round: ${round + 1}`
    };
    this.modalService.createModalOfType(NumberModalComponent, modalData).result.then(
      val => this.gameService.modifyScore(player, round, val),
      () => {}
    );
  }
}
