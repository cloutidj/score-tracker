import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SavedPlayersComponent } from './saved-players.component';

/**
 * Full-screen overlay host for {@link SavedPlayersComponent}. Opened from the shell via
 * `MatDialog` so the in-progress game stays mounted underneath (the old `/SavedPlayers`
 * route unmounted it). A header bar carries the title and an explicit ✕ close; the body
 * renders the (already-Material) saved-players editor unchanged.
 */
@Component({
  selector: 'st-saved-players-dialog',
  imports: [MatButtonModule, MatToolbarModule, FontAwesomeModule, SavedPlayersComponent],
  template: `
    <mat-toolbar class="dialog-header">
      <span class="dialog-title">Saved Players</span>
      <span class="header-spacer"></span>
      <button matIconButton type="button" aria-label="Close" (click)="dialogRef.close()">
        <fa-icon icon="xmark"></fa-icon>
      </button>
    </mat-toolbar>

    <div class="dialog-body">
      <st-saved-players />
    </div>
  `,
  styleUrl: './saved-players-dialog.component.scss',
})
export class SavedPlayersDialogComponent {
  readonly dialogRef = inject(MatDialogRef<SavedPlayersDialogComponent>);
}
