import { ColorFilterComponent } from './color-filter.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorSwatchComponent } from '../color-swatch/color-swatch.component';
import { By } from '@angular/platform-browser';
import { PlayerColor } from '@models/player-color';
import { Player } from '@models/player';

describe('ColorFilterComponent', () => {
  let fixture: ComponentFixture<ColorFilterComponent>;
  let component: ColorFilterComponent;
  const testColors = [new PlayerColor(1, 1, 1), new PlayerColor(255, 0, 0), new PlayerColor(0, 0, 255)];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ColorFilterComponent, ColorSwatchComponent],
      imports: []
    }).compileComponents();

    fixture = TestBed.createComponent(ColorFilterComponent);
    component = fixture.debugElement.componentInstance;
    component.colors = testColors;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show the available colors', () => {
    const colors = fixture.debugElement.queryAll(By.directive(ColorSwatchComponent));
    expect(colors.length).toEqual(3);
  });

  it('should emit changes when selecting a color', (done: DoneFn) => {
    component.changes.subscribe(() => done());
    fixture.debugElement.queryAll(By.directive(ColorSwatchComponent))[1].triggerEventHandler('click', null);
  });

  it('should highlight the selected colors', () => {
    const colors = fixture.debugElement.queryAll(By.directive(ColorSwatchComponent));
    colors[0].triggerEventHandler('click', null);
    colors[2].triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(colors[0].componentInstance.active).toEqual(true);
    expect(colors[1].componentInstance.active).toEqual(false);
    expect(colors[2].componentInstance.active).toEqual(true);
  });

  it('should deselect the colors when clicked again', () => {
    const colors = fixture.debugElement.queryAll(By.directive(ColorSwatchComponent));
    colors[0].triggerEventHandler('click', null);
    colors[2].triggerEventHandler('click', null);
    fixture.detectChanges();

    colors[2].triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(colors[0].componentInstance.active).toEqual(true);
    expect(colors[2].componentInstance.active).toEqual(false);
  });

  it('should be active when selecting a color', () => {
    expect(component.isActive()).toEqual(false);

    const colors = fixture.debugElement.queryAll(By.directive(ColorSwatchComponent));
    colors[2].triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.isActive()).toEqual(true);
  });

  it('should filter to the selected records', () => {
    const colors = fixture.debugElement.queryAll(By.directive(ColorSwatchComponent));
    colors[0].triggerEventHandler('click', null);
    colors[2].triggerEventHandler('click', null);
    fixture.detectChanges();

    const player = new Player(0);
    player.color = testColors[0];
    expect(component.accepts(player)).toEqual(true);

    player.color = testColors[1];
    expect(component.accepts(player)).toEqual(false);

    player.color = testColors[2];
    expect(component.accepts(player)).toEqual(true);
  });
});
