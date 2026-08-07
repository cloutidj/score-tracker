import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameTypeRegistry } from '@game/game-type-registry';
import { LastGameTypeService } from '@core/last-game-type.service';
import { PanelService } from '@core/panel/panel.service';

/**
 * The `''` route's target. Renders nothing itself — it either redirects to the
 * last-played game type's `/play/:gameType` (mirroring the same
 * `registry.byId()` check {@link PlayHostComponent} uses, so an id that passes
 * here can never fail there and bounce back), or, when there is no valid last
 * game type (first launch, or a deleted/renamed game type), leaves the route
 * empty and opens the Home panel so the player has to pick one.
 */
@Component({
  selector: 'st-app-entry',
  template: '',
})
export class AppEntryComponent {
  constructor() {
    const router = inject(Router);
    const registry = inject(GameTypeRegistry);
    const lastGameType = inject(LastGameTypeService);
    const panelService = inject(PanelService);

    const descriptor = registry.byId(lastGameType.get() ?? '');
    if (descriptor) {
      router.navigate(['/play', descriptor.id], { replaceUrl: true });
    } else {
      panelService.open('home');
    }
  }
}
