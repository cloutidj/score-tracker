import { TestBed } from '@angular/core/testing';
import { AppModule } from './app.module';
import { AppComponent } from './app.component';

describe('AppModule', () => {
  it('should create the module and load all code for code coverage', () => {
    TestBed.configureTestingModule({
      imports: [ AppModule ]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
