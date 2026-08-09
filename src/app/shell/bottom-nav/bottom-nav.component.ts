import { Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { PanelId } from '@core/panel/panel-id';
import { PanelService } from '@core/panel/panel.service';
import { ToggleIconDirective } from '@ui/toggle-icon/toggle-icon.directive';

interface BottomNavButton {
  readonly id: PanelId;
  readonly icon: string;
  readonly label: string;
}

/** The 4 panels reachable from the bottom nav, left to right. */
const BOTTOM_NAV_BUTTONS: readonly BottomNavButton[] = [
  { id: 'home', icon: 'phosphorHouse', label: 'Home' },
  { id: 'styles', icon: 'phosphorPalette', label: 'Styles' },
  { id: 'players', icon: 'phosphorUsers', label: 'Players' },
  { id: 'ruleSets', icon: 'phosphorBook', label: 'Rules' },
];

/**
 * The app's entire navigation: exactly 4 icon-only buttons (no labels), each
 * toggling its matching `PanelId` via {@link PanelService} — tapping the
 * already-open one closes it. Nothing is active while the player is looking
 * at the actual game (no panel open); there is no 5th "current game" tab.
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
  protected readonly buttons = BOTTOM_NAV_BUTTONS;
}
