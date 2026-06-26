import { animate, group, query, style } from '@angular/animations';

// Stack the entering and leaving pages on top of each other, filling the
// transition host exactly. The host is `position: relative; overflow: hidden`,
// so `position: absolute; inset: 0` sizes both pages against the *content box*
// (not the viewport) — they share one box and slide without resizing or
// snapping at the start/end of the transition.
const stackPages = query(
  ':enter, :leave',
  style({ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }),
  { optional: true },
);

const DURATION = '0.3s ease-in-out';

export const slideRouteRight = [
  stackPages,
  group([
    query(
      ':enter',
      [
        style({ transform: 'translateX(-100%)' }),
        animate(DURATION, style({ transform: 'translateX(0%)' })),
      ],
      { optional: true },
    ),
    query(
      ':leave',
      [
        style({ transform: 'translateX(0%)' }),
        animate(DURATION, style({ transform: 'translateX(100%)' })),
      ],
      { optional: true },
    ),
  ]),
];

export const slideRouteLeft = [
  stackPages,
  group([
    query(
      ':enter',
      [
        style({ transform: 'translateX(100%)' }),
        animate(DURATION, style({ transform: 'translateX(0%)' })),
      ],
      { optional: true },
    ),
    query(
      ':leave',
      [
        style({ transform: 'translateX(0%)' }),
        animate(DURATION, style({ transform: 'translateX(-100%)' })),
      ],
      { optional: true },
    ),
  ]),
];

export const slideRouteUp = [
  stackPages,
  group([
    query(
      ':enter',
      [
        style({ transform: 'translateY(100%)' }),
        animate(DURATION, style({ transform: 'translateY(0%)' })),
      ],
      { optional: true },
    ),
    query(
      ':leave',
      [
        style({ transform: 'translateY(0%)' }),
        animate(DURATION, style({ transform: 'translateY(-100%)' })),
      ],
      { optional: true },
    ),
  ]),
];

export const slideRouteDown = [
  stackPages,
  group([
    query(
      ':enter',
      [
        style({ transform: 'translateY(-100%)' }),
        animate(DURATION, style({ transform: 'translateY(0%)' })),
      ],
      { optional: true },
    ),
    query(
      ':leave',
      [
        style({ transform: 'translateY(0%)' }),
        animate(DURATION, style({ transform: 'translateY(100%)' })),
      ],
      { optional: true },
    ),
  ]),
];

export const fadeIn = [
  stackPages,
  query(':enter', [style({ opacity: 0 }), animate(DURATION, style({ opacity: 1 }))], {
    optional: true,
  }),
];