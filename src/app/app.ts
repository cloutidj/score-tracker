import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs/operators';
import { ThemeService } from '@util/theme.service';
import { Shell } from './shell/shell';
import { PanelHostComponent } from '@util/panel-host/panel-host.component';

@Component({
  selector: 'st-root',
  imports: [RouterOutlet, Shell, PanelHostComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly swUpdate = inject(SwUpdate);
  private readonly themeService = inject(ThemeService);

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
}
