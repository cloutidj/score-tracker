import { ChartDataset } from 'chart.js';

export interface ChartSeries<TType extends 'line' | 'bar'> {
  datasets: ChartDataset<TType>[];
  labels: string[];
}
