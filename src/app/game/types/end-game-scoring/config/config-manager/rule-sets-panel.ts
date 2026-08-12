import { PanelDescriptor } from '@core/panel/panel';
import { ScoringConfigManagerComponent } from './scoring-config-manager.component';

/** {@link PanelDescriptor} for the Rule Sets panel: end-game-scoring's config repository. */
export const ruleSetsPanel: PanelDescriptor = {
  id: 'ruleSets',
  title: 'Rule Sets',
  icon: 'phosphorBook',
  navLabel: 'Rules',
  component: ScoringConfigManagerComponent,
};
