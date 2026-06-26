import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ClarityModule } from '@clr/angular';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { transition, trigger } from '@angular/animations';
import { filter, map } from 'rxjs/operators';
import { ModalContainerComponent } from '@util/modal/modal-container.component';
import { ThemeService } from '@util/theme.service';
import {
  fadeIn,
  slideRouteDown,
  slideRouteLeft,
  slideRouteRight,
  slideRouteUp,
} from '@util/animations/routing.animation';

@Component({
  selector: 'st-root',
  imports: [RouterOutlet, RouterLink, ClarityModule, ModalContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [
    trigger('routerTransition', [
      transition('up => *', slideRouteDown),
      transition('* => up', slideRouteUp),
      transition(':increment', slideRouteLeft),
      transition(':decrement', slideRouteRight),
      transition('* => *', fadeIn),
    ]),
  ],
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

  protected routeState(outlet: RouterOutlet): unknown {
    return outlet.activatedRouteData['animationLevel'];
  }
}
