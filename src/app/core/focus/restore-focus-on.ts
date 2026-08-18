import { effect } from '@angular/core';
import { captureFocus } from './capture-focus';

/**
 * Remembers the element focused just before `isOpen` turns true, and refocuses it once
 * `isOpen` turns false again — the trigger-focus-restore half of an open/close surface
 * (dialog, menu, panel), independent of whatever else owns that surface's own focus trap.
 * Call from an injection context (e.g. a component constructor).
 */
export function restoreFocusOn(isOpen: () => boolean): void {
  let restore: (() => void) | null = null;

  effect(() => {
    if (isOpen()) {
      restore ??= captureFocus();
    } else if (restore) {
      restore();
      restore = null;
    }
  });
}
