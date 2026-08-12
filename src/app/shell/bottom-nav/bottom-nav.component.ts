import { Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { PanelRegistry } from '@core/panel/panel-registry';
import { PanelService } from '@core/panel/panel.service';
import { ToggleIconDirective } from '@ui/toggle-icon/toggle-icon.directive';

/**
 * The app's entire navigation: one icon-only button per registered
 * {@link PanelDescriptor} (no labels), each toggling its panel via
 * {@link PanelService} — tapping the already-open one closes it. Nothing is
 * active while the player is looking at the actual game (no panel open);
 * there is no 5th "current game" tab.
 *
 * The active-state treatment follows codepen.io/JavaScriptJunkie/pen/mdbZmdR's
 * "Navbar UI Interaction": each button owns its own pop-up circle (a
 * pseudo-element), triggered by `.is-active` instead of `:hover`. Unlike that
 * codepen, every button shares one skinnable accent rather than a distinct
 * color per icon — see bottom-nav.component.scss.
 */
@Component({
  selector: 'st-bottom-nav',
  imports: [NgIcon, ToggleIconDirective],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {
  protected readonly panelService = inject(PanelService);
  protected readonly buttons = inject(PanelRegistry).all();
}
