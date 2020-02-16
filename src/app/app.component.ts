import { IconService } from './icons/icon.service';
import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UnsubscribeComponent } from '@util/base/unsubscribe.component';
import { takeUntil } from 'rxjs/operators';
import { DocumentWrapperService } from './document-wrapper.service';
import { transition, trigger } from '@angular/animations';
import { fadeIn, slideRouteLeft, slideRouteRight, slideRouteDown, slideRouteUp } from '@util/animations/routing.animation';

@Component({
  selector: 'st-root',
  templateUrl: './app.component.html',
  animations: [
    trigger('routerTransition', [
      transition('up => *', slideRouteDown),
      transition('* => up', slideRouteUp),
      transition(':increment', slideRouteLeft),
      transition(':decrement', slideRouteRight),
      transition('* => *', fadeIn)
    ])
  ]
})
export class AppComponent extends UnsubscribeComponent implements OnInit {
  public updateAvailable = false;

  constructor(private updates: SwUpdate, private documentService: DocumentWrapperService, private iconService: IconService) {
    super();

    updates.available.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
      this.updateAvailable = true;
    });
  }

  ngOnInit(): void {
    this.iconService.initialize();
  }

  updateApplication(): void {
    this.updates.activateUpdate().then(() => this.documentService.reloadPage());
  }

  getState(outlet) {
    return outlet.activatedRouteData.animationLevel;
  }
}
