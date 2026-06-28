import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { transition, trigger } from '@angular/animations';
import { filter, map } from 'rxjs/operators';
import { ThemeService } from '@util/theme.service';
import { SavedPlayersDialogComponent } from '@player/saved-players/saved-players-dialog.component';
import { Shell } from './shell/shell';
import { fadeIn, slideRouteLeft, slideRouteRight } from '@util/animations/routing.animation';

@Component({
  selector: 'st-root',
  imports: [RouterOutlet, Shell],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [
    trigger('routerTransition', [
      transition(':increment', slideRouteLeft),
      transition(':decrement', slideRouteRight),
      transition('* => *', fadeIn),
    ]),
  ],
})
export class App {
  private readonly swUpdate = inject(SwUpdate);
  private readonly themeService = inject(ThemeService);
  private readonly dialog = inject(MatDialog);

  private playersDialog: MatDialogRef<SavedPlayersDialogComponent> | null = null;
  protected readonly playersOpen = signal(false);

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

  protected routeState(outlet: RouterOutlet): unknown {
    return outlet.activatedRouteData['animationLevel'];
  }
}
