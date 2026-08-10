import { PanelDescriptor } from '@core/panel/panel';
import { SavedPlayersComponent } from './saved-players.component';

/** {@link PanelDescriptor} for the Saved Players panel. */
export const savedPlayersPanel: PanelDescriptor = {
  id: 'players',
  title: 'Saved Players',
  icon: 'phosphorUsers',
  navLabel: 'Players',
  component: SavedPlayersComponent,
};
