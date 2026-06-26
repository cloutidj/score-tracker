import { Injectable } from '@angular/core';
import {
  ClarityIcons,
  angleIcon,
  barChartIcon,
  errorStandardIcon,
  floppyIcon,
  keyboardIcon,
  lineChartIcon,
  moonIcon,
  plusIcon,
  successStandardIcon,
  sunIcon,
  timesIcon,
  userIcon,
  usersIcon,
} from '@clr/angular';
import { scoreTrackerIcon } from './svg/score-tracker';

/**
 * Registers every icon the app uses with the Clarity icon registry.
 * In Clarity 18 the old `@clr/icons` (`ClarityIcons.add({...})` + shape
 * subpath imports) is gone: icons are tree-shaken tuples added via
 * `ClarityIcons.addIcons(...)` and rendered by the standalone `ClrIcon`
 * component (selector `clr-icon, cds-icon`) imported from `@clr/angular`.
 */
@Injectable({ providedIn: 'root' })
export class IconService {
  initialize(): void {
    ClarityIcons.addIcons(
      scoreTrackerIcon,
      angleIcon,
      barChartIcon,
      errorStandardIcon,
      floppyIcon,
      keyboardIcon,
      lineChartIcon,
      moonIcon,
      plusIcon,
      successStandardIcon,
      sunIcon,
      timesIcon,
      userIcon,
      usersIcon,
    );
  }
}
