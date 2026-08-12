import {
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { NgIcon } from '@ng-icons/core';
import { PanelRegistry } from '@core/panel/panel-registry';
import { PanelService } from '@core/panel/panel.service';
import { IconButtonComponent } from '@ui/icon-button/icon-button.component';

/**
 * Layered host for the app's contextual panels (Home, Styles, Saved Players,
 * Rule Sets — one per bottom-nav button). It overlays the **content region
 * only** — it mounts inside `.shell-content`, below the bottom nav, so the nav
 * (and its lit toggle) stays visible while a panel is open and the route/game
 * underneath stays mounted (no remount).
 *
 * Every panel shares one header: a title plus a single close (X) button — the
 * bottom nav has no header of its own to carry that affordance. Provides its own
 * focus trap (`cdkTrapFocus` + auto-capture), Esc-to-close, and focus returned to
 * the trigger on close.
 */
@Component({
  selector: 'st-panel-host',
  imports: [A11yModule, NgIcon, IconButtonComponent, NgComponentOutlet],
  templateUrl: './panel-host.component.html',
  styleUrl: './panel-host.component.scss',
})
export class PanelHostComponent {
  private readonly panelService = inject(PanelService);
  private readonly registry = inject(PanelRegistry);

  /** The currently open panel id, or `null` when none is open. */
  protected readonly openPanel = this.panelService.openPanel;

  /** The resolved descriptor for the open panel, or `undefined` when none is open. */
  protected readonly descriptor = computed(() => {
    const id = this.openPanel();
    return id ? this.registry.byId(id) : undefined;
  });

  /** The element that held focus before the panel opened, to restore on close. */
  private previouslyFocused: HTMLElement | null = null;

  /** The header element, present only while a panel is open (it's inside the `@if`). */
  private readonly headerEl = viewChild<ElementRef<HTMLElement>>('header');

  /**
   * The header's rendered height, fed back into `.panel-body`'s `padding-top` (see
   * the template's `--panel-header-height` binding) so scrolled content starts below
   * the floating, transparent header rather than under it. Measured rather than a
   * fixed constant because the header's height (safe-area inset, per-skin spacing)
   * isn't knowable from CSS alone.
   */
  protected readonly headerHeight = signal(0);

  constructor() {
    // Remember the trigger when a panel opens and hand focus back to it when the
    // panel closes — the focus-trap auto-capture moves focus into the panel, so
    // without this it would be lost to <body> on close.
    effect(() => {
      const open = this.openPanel() !== null;
      if (open) {
        this.previouslyFocused ??= document.activeElement as HTMLElement | null;
      } else if (this.previouslyFocused) {
        this.previouslyFocused.focus();
        this.previouslyFocused = null;
      }
    });

    effect((onCleanup) => {
      const header = this.headerEl()?.nativeElement;
      if (!header) {
        this.headerHeight.set(0);
        return;
      }

      const observer = new ResizeObserver(([entry]) => {
        this.headerHeight.set(entry.borderBoxSize[0].blockSize);
      });
      observer.observe(header);
      onCleanup(() => observer.disconnect());
    });
  }

  protected close(): void {
    this.panelService.close();
  }
}
