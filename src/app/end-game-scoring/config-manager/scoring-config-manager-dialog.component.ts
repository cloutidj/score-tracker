import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ScoringConfigManagerComponent } from './scoring-config-manager.component';

/**
 * Full-screen overlay host for {@link ScoringConfigManagerComponent} (mirrors the Saved Players
 * dialog). Opened from the shell toolbar so the in-progress game or setup screen stays mounted
 * underneath. A header bar carries the title and an explicit ✕ close.
 */
@Component({
  selector: 'st-scoring-config-manager-dialog',
  imports: [MatButtonModule, MatToolbarModule, FontAwesomeModule, ScoringConfigManagerComponent],
  template: `
    <mat-toolbar class="dialog-header">
      <span class="dialog-title">Rule sets</span>
      <span class="header-spacer"></span>
      <button matIconButton type="button" aria-label="Close" (click)="dialogRef.close()">
        <fa-icon icon="xmark"></fa-icon>
      </button>
    </mat-toolbar>

    <div class="dialog-body">
      <st-scoring-config-manager />
    </div>
  `,
  styleUrl: './scoring-config-manager-dialog.component.scss',
})
export class ScoringConfigManagerDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ScoringConfigManagerDialogComponent>);
}
