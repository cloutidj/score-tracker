import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ClarityModule, ClrAlert } from '@clr/angular';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Observable, of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { DocumentWrapperService } from './document-wrapper.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let mockSwUpdate: Partial<SwUpdate>;
  let activateUpdateSpy: jasmine.Spy;
  let mockDocument: jasmine.SpyObj<DocumentWrapperService>;

  function setupTest(available: Observable<any>): void {
    mockDocument = jasmine.createSpyObj('DocumentWrapperService', [ 'reloadPage' ]);
    activateUpdateSpy = jasmine.createSpy();
    mockSwUpdate = {
      available,
      activateUpdate: activateUpdateSpy
    };

    TestBed.configureTestingModule({
      declarations: [ AppComponent ],
      imports: [ ClarityModule ],
      providers: [
        { provide: SwUpdate, useValue: mockSwUpdate },
        { provide: DocumentWrapperService, useValue: mockDocument }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.debugElement.componentInstance;

    tick();
    fixture.detectChanges();
  }

  it('should create the component', fakeAsync(() => {
    setupTest(of());
    expect(component).toBeTruthy();
  }));

  it('should not show an alert when no update is available', fakeAsync(() => {
    setupTest(of());
    expect(fixture.debugElement.query(By.directive(ClrAlert))).toBeFalsy();
  }));

  it('should show an alert when an update is available', fakeAsync(() => {
    setupTest(of(true));
    expect(fixture.debugElement.query(By.directive(ClrAlert))).toBeTruthy();
  }));

  it('should update the application when clicking Update', fakeAsync(() => {
    setupTest(of(true));
    activateUpdateSpy.and.returnValue(Promise.resolve());
    const updateButton = fixture.debugElement.query(By.css('button'));
    updateButton.triggerEventHandler('click', null);
    expect(activateUpdateSpy).toHaveBeenCalled();
    tick();
    expect(mockDocument.reloadPage).toHaveBeenCalled();
  }));
});
