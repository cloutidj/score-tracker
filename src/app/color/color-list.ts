import { StColor } from '@color/models/st-color';
import { ColorHelper } from '@color/models/color-helper';
import {InjectionToken} from '@angular/core';

export const COLOR_LIST = new InjectionToken<StColor[]>('COLOR_LIST');

export const colorList: StColor[] = [
  ColorHelper.create(139, 25, 32, 'Red'),
  ColorHelper.create(50, 102, 37, 'Green'),
  ColorHelper.create(1, 73, 132, 'Blue'),
  ColorHelper.create(204, 159, 8, 'Yellow'),
  ColorHelper.create(120, 43, 120, 'Purple'),
  ColorHelper.create(190, 92, 0, 'Orange'),
  ColorHelper.create(197, 47, 122, 'Pink'),
  ColorHelper.create(0, 121, 107, 'Teal'),
  ColorHelper.create(121, 85, 72, 'Brown'),
  ColorHelper.create(10, 10, 10, 'Black'),
  ColorHelper.create(117, 117, 117, 'Gray'),
  ColorHelper.create(230, 230, 230, 'White'),
];
