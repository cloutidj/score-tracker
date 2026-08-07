import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs/operators';
import { PanelHostComponent } from '@ui/panel-host/panel-host.component';
import { BottomNavComponent } from './shell/bottom-nav/bottom-nav.component';
import { UpdateToastComponent } from './shell/update-toast/update-toast.component';

@Component({
  selector: 'st-root',
  imports: [RouterOutlet, PanelHostComponent, BottomNavComponent, UpdateToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly swUpdate = inject(SwUpdate);

  private readonly updateAvailable = toSignal(
    this.swUpdate.versionUpdates.pipe(
      filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'),
      map(() => true),
    ),
    { initialValue: false },
  );

  private readonly dismissed = signal(false);

  protected readonly showUpdateToast = computed(() => this.updateAvailable() && !this.dismissed());

  protected updateApplication(): void {
    this.swUpdate.activateUpdate().then(() => document.location.reload());
  }

  protected dismissUpdate(): void {
    this.dismissed.set(true);
  }
}
