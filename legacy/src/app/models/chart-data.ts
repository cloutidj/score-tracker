import { ChartDataSets } from 'chart.js';
import { Colors } from 'ng2-charts';

export interface ChartData {
  chartData: ChartDataSets[];
  labels: string[];
  colors: Colors[];
}
