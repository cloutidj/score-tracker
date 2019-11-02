import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PerRoundScoreLineChartComponent } from './per-round-score-line-chart.component';
import { BaseChartDirective, ChartsModule } from 'ng2-charts';
import { PerRoundScoringService, ScoreChangeType } from '../providers/per-round-scoring.service';
import { EventEmitter } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ChartData } from '@models/chart-data';

describe('PerRoundScoreLineChartComponent', () => {
  let fixture: ComponentFixture<PerRoundScoreLineChartComponent>;
  let component: PerRoundScoreLineChartComponent;
  let scoreService: jasmine.SpyObj<PerRoundScoringService>;
  const lineChartData: ChartData = {
    chartData: [ { data: [ 0, 1 ], label: 'Series A' } ],
    labels: [ 'Label A', 'Label B' ],
    colors: [ { borderColor: 'red' } ]
  };
  const event = new EventEmitter<ScoreChangeType>();

  function getChartDirective(): BaseChartDirective {
    const chartElement = fixture.debugElement.query(By.directive(BaseChartDirective));
    return chartElement.injector.get(BaseChartDirective);
  }

  beforeEach(() => {
    scoreService = jasmine.createSpyObj('PerRoundScoringService', [ 'lineChartData', 'scoreChangeEvent' ]);
    scoreService.lineChartData.and.returnValue(lineChartData);
    scoreService.scoreChangeEvent.and.returnValue(event);

    TestBed.configureTestingModule({
      declarations: [ PerRoundScoreLineChartComponent ],
      imports: [ ChartsModule ],
      providers: [
        { provide: PerRoundScoringService, useValue: scoreService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerRoundScoreLineChartComponent);
    component = fixture.debugElement.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should bind the chart data', () => {
    const chartDirective = getChartDirective();
    expect(chartDirective.chartType).toEqual('line');
    expect(chartDirective.datasets[ 0 ].data).toEqual(lineChartData.chartData[ 0 ].data);
    expect(chartDirective.labels).toEqual(lineChartData.labels);
  });

  it('should refresh the chart on a score modify event', fakeAsync(() => {
    const chartDirective = getChartDirective();
    spyOn(chartDirective, 'update');

    event.emit(ScoreChangeType.Add);
    tick();
    expect(chartDirective.update).not.toHaveBeenCalled();

    event.emit(ScoreChangeType.Modify);
    tick();
    expect(chartDirective.update).toHaveBeenCalled();
  }));
});
