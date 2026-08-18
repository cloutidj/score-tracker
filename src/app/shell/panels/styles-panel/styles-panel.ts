import { PanelDescriptor } from '@core/panel/panel';
import { StylesPanelComponent } from './styles-panel.component';

/** {@link PanelDescriptor} for the Styles panel: theme + skin picker. */
export const stylesPanel: PanelDescriptor = {
  id: 'styles',
  title: 'Styles',
  icon: 'phosphorPalette',
  navLabel: 'Styles',
  component: StylesPanelComponent,
};
