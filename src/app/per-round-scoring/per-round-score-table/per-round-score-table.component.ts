import { Component, inject, signal } from '@angular/core';
import { ClarityModule } from '@clr/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Player } from '@models/player';
import { ModalService } from '@util/modal/modal.service';
import { NumberModalComponent, NumberModalData } from '@util/number-modal/number-modal.component';
import { PerRoundScoringService } from '../per-round-scoring.service';
import { GameRound } from '../models/game-round';

const ROUND_CUTOFF = 10;

@Component({
  selector: 'st-per-round-score-table',
  imports: [ClarityModule, FontAwesomeModule],
  templateUrl: './per-round-score-table.component.html',
  styleUrl: './per-round-score-table.component.scss',
})
export class PerRoundScoreTableComponent {
  readonly gameService = inject(PerRoundScoringService);
  private readonly modalService = inject(ModalService);

  readonly showAllRounds = signal(false);

  trimmedTable(): boolean {
    return this.gameService.gameRounds().length > ROUND_CUTOFF;
  }

  showRound(roundIndex: number): boolean {
    return this.showAllRounds() || roundIndex >= this.gameService.gameRounds().length - ROUND_CUTOFF;
  }

  editScore(player: Player, round: GameRound): void {
    const modalData: NumberModalData = {
      title: `Edit Score for ${player.name} - ${round.label}`,
    };
    this.modalService.createModalOfType(NumberModalComponent, modalData).result.then(
      (val) => this.gameService.modifyScore(player, round.roundId, val),
      () => {
        /* modal dismissed — leave the score unchanged */
      },
    );
  }
}
