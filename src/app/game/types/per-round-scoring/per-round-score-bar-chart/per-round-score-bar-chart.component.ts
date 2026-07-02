import { Component, inject } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { PerRoundScoringService } from '../per-round-scoring.service';

@Component({
  selector: 'st-per-round-score-bar-chart',
  imports: [BaseChartDirective],
  template: `
    <div class="st-chart-wrapper">
      <canvas
        baseChart
        type="bar"
        [datasets]="gameService.barChartData().datasets"
        [labels]="gameService.barChartData().labels"
        [options]="chartOptions"
      ></canvas>
    </div>
  `,
})
export class PerRoundScoreBarChartComponent {
  readonly gameService = inject(PerRoundScoringService);

  // chart.js 4 dropped the `horizontalBar` type — it's now a `bar` chart with `indexAxis: 'y'`,
  // which moves the value axis (the `beginAtZero` one) from x to y → x in option terms.
  readonly chartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      x: { beginAtZero: true },
    },
  };
}
