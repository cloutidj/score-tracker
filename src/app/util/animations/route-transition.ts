import { ActivatedRouteSnapshot, ViewTransitionInfo } from '@angular/router';

/** Deepest `animationLevel` route-data value along a snapshot chain (0 if none). */
function animationLevel(snapshot: ActivatedRouteSnapshot): number {
  let level = 0;
  for (let route: ActivatedRouteSnapshot | null = snapshot; route; route = route.firstChild) {
    const value = route.data['animationLevel'];
    if (typeof value === 'number') {
      level = value;
    }
  }
  return level;
}

/**
 * Direction hook for the router's View Transitions. Tags `<html>` with
 * `route-forward` / `route-back` based on the routes' `animationLevel`, which the
 * CSS in `src/styles/_motion.scss` reads to slide the outgoing/incoming pages the
 * right way. The very first navigation (no previous leveled route) keeps the
 * browser's default cross-fade so the app doesn't slide in on cold load.
 */
export function onRouteViewTransition({ from, to, transition }: ViewTransitionInfo): void {
  const fromLevel = animationLevel(from);
  if (fromLevel === 0) {
    return;
  }

  const toLevel = animationLevel(to);
  const direction =
    toLevel > fromLevel ? 'route-forward' : toLevel < fromLevel ? 'route-back' : null;
  if (!direction) {
    return;
  }

  const root = document.documentElement;
  root.classList.add(direction);
  transition.finished.finally(() => root.classList.remove(direction));
}
