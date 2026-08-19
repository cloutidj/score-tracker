import { Component, computed, effect, input, model, signal } from '@angular/core';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { NgIcon } from '@ng-icons/core';

/** One choosable value + its display label. */
export interface SelectOption<T> {
  value: T;
  label: string;
}

/**
 * A drop-in replacement for a plain `<select>`, whose native open option list is a UA
 * popup this app can't reliably theme (see docs/UI-COMPONENTS.md § Common Issues /
 * Troubleshooting) — so this renders its own listbox instead, the same
 * `cdkConnectedOverlay` pattern already used for the player color-picker menu
 * (`st-color-picker`).
 *
 * Value equality is `===`, so `T` should be a primitive (string/number/enum) —
 * every current call site only ever selects among primitives. Add a
 * `compareWith` input if an object-valued call site ever needs one; don't add
 * it speculatively.
 *
 * ```html
 * <st-select [options]="skinOptions" [(value)]="selectedSkin" placeholder="Choose a skin" />
 * ```
 */
@Component({
  selector: 'st-select',
  host: { 'st-layout': 'full-width' },
  imports: [OverlayModule, NgIcon],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
})
export class SelectComponent<T> {
  readonly options = input.required<readonly SelectOption<T>[]>();
  readonly placeholder = input('Select…');
  readonly disabled = input(false);

  /** Two-way bindable via `[(value)]`; `null` while nothing is selected. */
  readonly value = model<T | null>(null);

  protected readonly menuOpen = signal(false);

  protected readonly selectedOption = computed(
    () => this.options().find((option) => option.value === this.value()) ?? null,
  );

  /** Left edges aligned, opening below the trigger with an above fallback when there's no room. */
  protected readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
  ];

  /** The element that held focus before the menu opened, to restore on close —
   *  same pattern as `panel-host.component.ts` / `color-picker.component.ts`. */
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const open = this.menuOpen();
      if (open) {
        this.previouslyFocused ??= document.activeElement as HTMLElement | null;
      } else if (this.previouslyFocused) {
        this.previouslyFocused.focus();
        this.previouslyFocused = null;
      }
    });
  }

  protected toggleMenu(): void {
    if (this.disabled()) return;
    this.menuOpen.set(!this.menuOpen());
  }

  protected selectOption(value: T): void {
    this.value.set(value);
    this.closeMenu();
  }

  protected closeMenu(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
  }

  protected onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeMenu();
    }
  }

  /** Mirrors `color-picker.component.ts`'s own handler — see its doc comment. */
  protected onTriggerEscape(event: Event): void {
    if (this.menuOpen()) {
      event.stopPropagation();
      this.closeMenu();
    }
  }
}
