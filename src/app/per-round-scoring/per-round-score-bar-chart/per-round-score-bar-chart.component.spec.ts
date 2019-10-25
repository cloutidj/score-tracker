import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PerRoundScoreBarChartComponent } from './per-round-score-bar-chart.component';
import { BaseChartDirective, ChartsModule } from 'ng2-charts';
import { PerRoundScoringService, ScoreChangeType } from '../providers/per-round-scoring.service';
import { By } from '@angular/platform-browser';
import { ChartData } from '@models/chart-data';
import { EventEmitter } from '@angular/core';

describe('PerRoundScoreBarChartComponent', () => {
  let fixture: ComponentFixture<PerRoundScoreBarChartComponent>;
  let component: PerRoundScoreBarChartComponent;
  let scoreService: jasmine.SpyObj<PerRoundScoringService>;
  const barChartData: ChartData = {
    chartData: [ { data: [ 0, 1 ], label: 'Series A' } ],
    labels: [ 'Label A', 'Label B' ]
  };
  const event = new EventEmitter<ScoreChangeType>();

  function getChartDirective(): BaseChartDirective {
    const chartElement = fixture.debugElement.query(By.directive(BaseChartDirective));
    return chartElement.injector.get(BaseChartDirective);
  }

  beforeEach(() => {
    scoreService = jasmine.createSpyObj('PerRoundScoringService', [ 'barChartData', 'scoreChangeEvent' ]);
    scoreService.barChartData.and.returnValue(barChartData);
    scoreService.scoreChangeEvent.and.returnValue(event);

    TestBed.configureTestingModule({
      declarations: [ PerRoundScoreBarChartComponent ],
      imports: [ ChartsModule ],
      providers: [
        { provide: PerRoundScoringService, useValue: scoreService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerRoundScoreBarChartComponent);
    component = fixture.debugElement.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should bind the chart data', () => {
    const chartDirective = getChartDirective();
    expect(chartDirective.chartType).toEqual('horizontalBar');
    expect(chartDirective.datasets[ 0 ].data).toEqual(barChartData.chartData[ 0 ].data);
    expect(chartDirective.labels).toEqual(barChartData.labels);
  });

  it('should refresh the chart on a score change', fakeAsync(() => {
    const chartDirective = getChartDirective();
    spyOn(chartDirective, 'update');

    event.emit(ScoreChangeType.Add);
    tick();

    expect(chartDirective.update).toHaveBeenCalled();
  }));
});
