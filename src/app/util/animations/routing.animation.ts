import { animate, group, query, style } from '@angular/animations';

export const slideRouteRight = [
  query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
  group([
    query(':enter', [
      style({ transform: 'translateX(-100%)' }),
      animate('0.5s ease-in-out', style({ transform: 'translateX(0%)' }))
    ], { optional: true }),
    query(':leave', [
      style({ transform: 'translateX(0%)' }),
      animate('0.5s ease-in-out', style({ transform: 'translateX(100%)' }))
    ], { optional: true }),
  ])
];

export const slideRouteLeft = [
  query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
  group([
    query(':enter', [
      style({ transform: 'translateX(100%)' }),
      animate('0.5s ease-in-out', style({ transform: 'translateX(0%)' }))
    ], { optional: true }),
    query(':leave', [
      style({ transform: 'translateX(0%)' }),
      animate('0.5s ease-in-out', style({ transform: 'translateX(-100%)' }))
    ], { optional: true }),
  ])
];

export const slideRouteUp = [
  query(':enter, :leave', style({ position: 'fixed', height: '100%',  width: '100%', overflow: 'hidden' }), { optional: true }),
  group([
    query(':enter', [
      style({ transform: 'translateY(100%)' }),
      animate('0.5s ease-in-out', style({ transform: 'translateY(0%)', overflow: 'hidden' }))
    ], { optional: true }),
    query(':leave', [
      style({ transform: 'translateY(0%)' }),
      animate('0.5s ease-in-out', style({ transform: 'translateY(-100%)', overflow: 'hidden' }))
    ], { optional: true }),
  ])
];

export const slideRouteDown = [
  query(':enter, :leave', style({ position: 'fixed', height: '100%',  width: '100%', overflow: 'hidden' }), { optional: true }),
  group([
    query(':enter', [
      style({ transform: 'translateY(-100%)' }),
      animate('0.5s ease-in-out', style({ transform: 'translateY(0%)', overflow: 'hidden' }))
    ], { optional: true }),
    query(':leave', [
      style({ transform: 'translateY(0%)' }),
      animate('0.5s ease-in-out', style({ transform: 'translateY(100%)', overflow: 'hidden' }))
    ], { optional: true }),
  ])
];

export const fadeIn = [
  query(':enter', [
    style({ opacity: 0 }),
    animate('0.5s ease-in-out', style({ opacity: 1 }))
  ], { optional: true })
];
