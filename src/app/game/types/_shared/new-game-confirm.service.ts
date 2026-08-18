import { inject, Injectable } from '@angular/core';
import { ConfirmService } from '@ui/confirm-dialog/confirm.service';

/** The shared "discard and start over" prompt used by every game view. */
@Injectable({ providedIn: 'root' })
export class NewGameConfirmService {
  private readonly confirm = inject(ConfirmService);

  /** Confirm discarding the current game, running `onConfirm` if accepted. */
  newGame(onConfirm: () => void): void {
    this.confirm
      .ask({
        title: 'New Game',
        message: 'Discard the current game and start over?',
        confirmLabel: 'New Game',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          onConfirm();
        }
      });
  }
}
