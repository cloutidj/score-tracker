import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { ModalContainerComponent } from '@util/modal/modal-container.component';

@Component({
  selector: 'st-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ClarityModule, ModalContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
