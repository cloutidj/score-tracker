import { animate, style } from '@angular/animations';

export const pulseGrow = [
  animate('200ms ease-out', style({ transform: 'scale(1, 1.1)' })),
  animate('200ms ease-out', style({ transform: 'scale(1, 1)' }))
];

export const pulseShrink = [
  animate('200ms ease-out', style({ transform: 'scale(1, .9)' })),
  animate('200ms ease-out', style({ transform: 'scale(1, 1)' }))
];
