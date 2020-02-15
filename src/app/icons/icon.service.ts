import { Injectable } from '@angular/core';
import { ClarityIcons } from '@clr/icons';
import { iconSvg as scoreTrackerIcon } from './svg/score-tracker';
import '@clr/icons/shapes/essential-shapes';
import '@clr/icons/shapes/technology-shapes';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  public initialize(): void {
    ClarityIcons.add({ 'score-tracker': scoreTrackerIcon });
  }
}
