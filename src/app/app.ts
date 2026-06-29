import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs/operators';
import { ThemeService } from '@util/theme.service';
import { SavedPlayersDialogComponent } from '@player/saved-players/saved-players-dialog.component';
import { ScoringConfigManagerDialogComponent } from './end-game-scoring/config-manager/scoring-config-manager-dialog.component';
import { Shell } from './shell/shell';

@Component({
  selector: 'st-root',
  imports: [RouterOutlet, Shell],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly swUpdate = inject(SwUpdate);
  private readonly themeService = inject(ThemeService);
  private readonly dialog = inject(MatDialog);

  private playersDialog: MatDialogRef<SavedPlayersDialogComponent> | null = null;
  protected readonly playersOpen = signal(false);

  private ruleSetsDialog: MatDialogRef<ScoringConfigManagerDialogComponent> | null = null;
  protected readonly ruleSetsOpen = signal(false);

  protected readonly theme = this.themeService.theme;

  protected readonly updateAvailable = toSignal(
    this.swUpdate.versionUpdates.pipe(
      filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'),
      map(() => true),
    ),
    { initialValue: false },
  );

  protected updateApplication(): void {
    this.swUpdate.activateUpdate().then(() => document.location.reload());
  }

  protected toggleTheme(): void {
    this.themeService.toggle();
  }

  // The players entry acts as a toggle: open the full-screen overlay if closed,
  // or close it (returning to the game underneath) if already open. The game
  // component stays mounted the whole time, so the in-progress game is preserved.
  protected openPlayers(): void {
    if (this.playersDialog) {
      this.playersDialog.close();
      return;
    }

    this.playersOpen.set(true);
    this.playersDialog = this.dialog.open(SavedPlayersDialogComponent, {
      panelClass: 'st-fullscreen-dialog',
      width: '100vw',
      maxWidth: '100vw',
      height: '100dvh',
    });
    this.playersDialog.afterClosed().subscribe(() => {
      this.playersDialog = null;
      this.playersOpen.set(false);
    });
  }

  // Same toggle behavior as the players overlay: open the full-screen rule-set manager
  // if closed, or close it if already open. The game underneath stays mounted, so an
  // in-progress game (or the end-game setup screen) is preserved.
  protected openRuleSets(): void {
    if (this.ruleSetsDialog) {
      this.ruleSetsDialog.close();
      return;
    }

    this.ruleSetsOpen.set(true);
    this.ruleSetsDialog = this.dialog.open(ScoringConfigManagerDialogComponent, {
      panelClass: 'st-fullscreen-dialog',
      width: '100vw',
      maxWidth: '100vw',
      height: '100dvh',
    });
    this.ruleSetsDialog.afterClosed().subscribe(() => {
      this.ruleSetsDialog = null;
      this.ruleSetsOpen.set(false);
    });
  }
}
