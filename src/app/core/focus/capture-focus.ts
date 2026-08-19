/** Snapshots the currently focused element and returns a function that refocuses it. */
export function captureFocus(): () => void {
  const previouslyFocused = document.activeElement as HTMLElement | null;
  return () => previouslyFocused?.focus();
}
