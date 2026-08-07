import { Component, computed, inject } from '@angular/core';
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
 * The active-state treatment follows codepen.io/chrisbautista/pen/NWXjqLN's
 * "tab-style1" specifically: the active item itself rises into a circle, and
 * a single shared "collar" (`.bottom-nav-follow`) slides beneath it to
 * whichever position is active, rather than each button owning its own
 * pop-up bubble. Reimplemented from this app's own tokens, not the codepen's
 * literal CSS — see bottom-nav.component.scss for the one deliberate
 * simplification (no scalloped notches).
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

  /** Index of the active button, or `null` when no panel is open — drives the
   *  sliding collar's position and visibility. */
  protected readonly activeIndex = computed<number | null>(() => {
    const open = this.panelService.openPanel();
    const index = BOTTOM_NAV_BUTTONS.findIndex((button) => button.id === open);
    return index === -1 ? null : index;
  });
}
