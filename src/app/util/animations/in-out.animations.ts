import { animate, style } from '@angular/animations';

export const fadeInDown = [
  style({ transform: 'translateY(-100%)', opacity: 0 }),
  animate('400ms ease-out', style({ transform: 'translateY(0%)', opacity: 1 }))
];

export const fadeOutUp = [
  style({ transform: 'translateY(0%)', opacity: 1 }),
  animate('400ms ease-in', style({ transform: 'translateY(-100%)', opacity: 0 }))
];

export const slideInLeft = [
  style({ transform: 'translateX(100%)', opacity: 0 }),
  animate('400ms ease-out', style({ transform: 'translateX(0%)', opacity: 1 }))
];
