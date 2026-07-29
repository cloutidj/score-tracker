import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { NgIcon } from '@ng-icons/core';
import { StColor } from '@color/models/st-color';
import { ColorHelper } from '@color/models/color-helper';
import { ColorSwatchComponent } from '../color-swatch/color-swatch.component';
import { IconButtonComponent } from '@ui/icon-button/icon-button.component';
import { ToggleIconDirective } from '@ui/toggle-icon/toggle-icon.directive';
import {COLOR_LIST} from '@color/color-list';

@Component({
  selector: 'st-color-picker',
  imports: [OverlayModule, NgIcon, IconButtonComponent, ToggleIconDirective, ColorSwatchComponent],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss',
})
export class ColorPickerComponent implements FormValueControl<StColor | null> {
  readonly playerColors = inject(COLOR_LIST);

  /** Two-way bound to the field value by `[formField]`. */
  readonly value = model<StColor | null>(null);
  /** Field state, auto-bound by `[formField]`. */
  readonly invalid = input(false);
  readonly touched = input(false);
  readonly disabled = input(false);
  /** Emitted to mark the field touched once the user finishes with the menu. */
  readonly touch = output<void>();

  /** Shows its own error ring once invalid and touched. */
  protected readonly showError = computed(() => this.invalid() && this.touched());
  /** Open while the swatch menu is showing — drives the shared `stToggleIcon`
   *  active-glyph swap (outline → filled) on the trigger. */
  protected readonly menuOpen = signal(false);

  /** Right edges aligned, opening below the trigger with an above fallback when there's no room. */
  protected readonly positions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
  ];

  /** Per-swatch display model for the menu grid — hex/label formatting and the active
   * flag precomputed once instead of being recalculated per binding in the template.
   * Active is matched by color value, not object identity, so a value written from a
   * deserialized player still highlights the canonical swatch. */
  protected readonly swatches = computed(() => {
    const value = this.value();
    return this.playerColors.map((color) => ({
      color,
      hex: ColorHelper.hexString(color),
      label: ColorHelper.label(color),
      active: ColorHelper.sameColor(value ?? undefined, color),
    }));
  });

  /** The swatch matching the current value, if any — drives the trigger's label and fill. */
  protected readonly selectedSwatch = computed(() => this.swatches().find((s) => s.active) ?? null);

  protected readonly triggerLabel = computed(() => {
    const swatch = this.selectedSwatch();
    return swatch ? `Player color: ${swatch.label}. Change color.` : 'Choose player color';
  });

  /** The element that held focus before the menu opened, to restore on close —
   * same pattern as `panel-host.component.ts`. */
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

  selectColor(color: StColor): void {
    this.value.set(color);
    this.closeMenu();
  }

  protected closeMenu(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    this.touch.emit();
  }

  protected onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeMenu();
    }
  }

  /** Focus never moves off the trigger into the overlay (no focus trap), so Escape while
   * the menu is open fires here rather than through `onOverlayKeydown`. Stop it from also
   * bubbling to an enclosing panel's own Escape-to-close handler (e.g. `panel-host`) —
   * only the color menu should close on this press. */
  protected onTriggerEscape(event: Event): void {
    if (this.menuOpen()) {
      event.stopPropagation();
      this.closeMenu();
    }
  }
}
