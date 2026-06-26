import { Injectable } from '@angular/core';
import '@cds/core/icon/register.js';
import {
  ClarityIcons,
  angleIcon,
  barChartIcon,
  errorStandardIcon,
  floppyIcon,
  keyboardIcon,
  lineChartIcon,
  plusIcon,
  successStandardIcon,
  timesIcon,
  userIcon,
  usersIcon,
} from '@cds/core/icon';
import { scoreTrackerIcon } from './svg/score-tracker';

/**
 * Registers every icon the app uses with the Clarity/CDS icon registry.
 * In Clarity 18 the old `@clr/icons` (`ClarityIcons.add({...})` + shape
 * subpath imports) is gone: icons are tree-shaken tuples added via
 * `ClarityIcons.addIcons(...)` and rendered with the `<cds-icon>` element.
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
      plusIcon,
      successStandardIcon,
      timesIcon,
      userIcon,
      usersIcon,
    );
  }
}
