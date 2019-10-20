import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PerRoundScoringModule } from './per-round-scoring/per-round-scoring.module';
import { HomeComponent } from './home/home.component';
import { UtilModule } from '@util/util.module';
import { ClarityModule } from '@clr/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DEFAULT_PLAYER_COUNT } from '@util/injection-tokens';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PerRoundScoringModule,
    UtilModule,
    ClarityModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    { provide: DEFAULT_PLAYER_COUNT, useValue: 2 }
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {}
