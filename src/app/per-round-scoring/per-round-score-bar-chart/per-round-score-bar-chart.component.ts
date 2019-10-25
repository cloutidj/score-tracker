import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { PerRoundScoringService } from '../providers/per-round-scoring.service';
import { BaseChartDirective } from 'ng2-charts';
import { UnsubscribeComponent } from '@util/base/unsubscribe.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'st-per-round-score-bar-chart',
  template: `
      <div class="st-chart-wrapper">
          <canvas baseChart
                  [datasets]="gameService.barChartData().chartData"
                  chartType="horizontalBar"
                  [labels]="gameService.barChartData().labels"
                  [options]="chartOptions"
          ></canvas>
      </div>`
})
export class PerRoundScoreBarChartComponent extends UnsubscribeComponent implements AfterViewInit {
  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      xAxes: [
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
    this.gameService.scoreChangeEvent()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => this.chart.update());
  }
}
