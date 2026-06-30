import { Component, inject } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { PerRoundScoringService } from '../per-round-scoring.service';

@Component({
  selector: 'st-per-round-score-line-chart',
  imports: [BaseChartDirective],
  template: `
    <div class="st-chart-wrapper">
      <canvas
        baseChart
        type="line"
        [datasets]="gameService.lineChartData().datasets"
        [labels]="gameService.lineChartData().labels"
        [options]="chartOptions"
      ></canvas>
    </div>
  `,
})
export class PerRoundScoreLineChartComponent {
  readonly gameService = inject(PerRoundScoringService);

  readonly chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: { beginAtZero: true },
    },
  };
}
