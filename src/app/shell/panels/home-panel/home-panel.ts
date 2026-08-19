import { PanelDescriptor } from '@core/panel/panel';
import { HomePanelComponent } from './home-panel.component';

/** {@link PanelDescriptor} for the Home panel: one card per registered game type. */
export const homePanel: PanelDescriptor = {
  id: 'home',
  title: 'Choose a Game',
  icon: 'phosphorHouse',
  navLabel: 'Home',
  component: HomePanelComponent,
};
