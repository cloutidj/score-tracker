import { PanelDescriptor } from '@core/panel/panel';
import { CalculatorPanelComponent } from './calculator-panel.component';

/** {@link PanelDescriptor} for the Calculator panel: a player-less number pad for quick sums. */
export const calculatorPanel: PanelDescriptor = {
  id: 'calculator',
  title: 'Calculator',
  icon: 'phosphorCalculator',
  navLabel: 'Calculator',
  component: CalculatorPanelComponent,
};
