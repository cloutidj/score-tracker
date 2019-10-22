import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { PerRoundScoringService, ScoreChangeType } from '../per-round-scoring.service';
import { UnsubscribeComponent } from '@util/base/unsubscribe.component';
import { BaseChartDirective } from 'ng2-charts';
import { filter, takeUntil } from 'rxjs/operators';

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
export class PerRoundScoreLineChartComponent extends UnsubscribeComponent implements AfterViewInit {
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

  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  constructor(public gameService: PerRoundScoringService) { super(); }

  ngAfterViewInit(): void {
    this.gameService.scoreChangeEvent
      .pipe(
        takeUntil(this.unsubscribe),
        filter(e => e === ScoreChangeType.Modify))
      .subscribe(() => this.chart.update());
  }
}
