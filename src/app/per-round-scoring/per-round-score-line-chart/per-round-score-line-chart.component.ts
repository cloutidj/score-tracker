import { Component } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { PerRoundScoringService } from '../per-round-scoring.service';

@Component({
  selector: 'st-per-round-score-line-chart',
  template: `
      <div class="st-chart-wrapper">
          <canvas baseChart
                  [datasets]="gameService.lineChartData.chartData"
                  chartType="line"
                  [labels]="gameService.lineChartData.labels"
                  [options]="chartOptions"
          ></canvas>
      </div>`
})
export class PerRoundScoreLineChartComponent {
  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true
          }
        } ]
    }
  };

  constructor(public gameService: PerRoundScoringService) {}
}
