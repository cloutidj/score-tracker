import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { GameTypeRegistry } from '@game/game-type-registry';
import { PanelService } from '@core/panel/panel.service';
import { GameType } from '@game/game-type';

/**
 * The Home panel's body: one card per registered game type. Picking one
 * closes the panel and navigates to `/play/:gameType` — {@link PlayHostComponent}'s
 * constructor is what remembers it as the last-played type, so this doesn't
 * duplicate that write.
 */
@Component({
  selector: 'st-home-panel',
  imports: [NgIcon],
  templateUrl: './home-panel.component.html',
  styleUrl: './home-panel.component.scss',
})
export class HomePanelComponent {
  private readonly router = inject(Router);
  private readonly panelService = inject(PanelService);

  protected readonly gameTypes = inject(GameTypeRegistry).all();

  protected select(type: GameType): void {
    this.panelService.close();
    this.router.navigate(['/play', type.id]);
  }
}
