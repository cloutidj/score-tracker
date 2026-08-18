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
import { IconButtonComponent } from '@ui/button/icon-button.component';
import { restoreFocusOn } from '@core/focus/restore-focus-on';

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

  /** The previously-open panel's resolved descriptor, or `undefined` if there wasn't one. */
  private readonly previousDescriptor = computed(() => {
    const id = this.panelService.previousPanel();
    return id ? this.registry.byId(id) : undefined;
  });

  /** {@link descriptor} wrapped in a 0/1-length array so the template can track it in a `@for`. */
  protected readonly contentTokens = computed(() => {
    const desc = this.descriptor();
    return desc ? [desc] : [];
  });

  /**
   * The direction both `.panel-content` animations (`.panel-content-enter`/`-leave` in
   * `panel-host.component.scss`) read via the `--panel-switch-dir` CSS custom property on
   * `.panel-body`:
   * `-1`/`1` for a switch (forward/back through `PanelRegistry`-assigned `index`, which
   * matches the bottom nav's left-to-right button order), `0` for opening from closed or
   * closing to none (no horizontal motion — the outer shell's own fade already carries
   * that moment).
   *
   * Neither the entering nor the leaving item can have this frozen onto itself: the
   * leaving item's correct direction depends on where the switch is headed, which isn't
   * knowable from the item alone once Angular drops it from the tracked list (bindings on
   * a removed item stop being re-evaluated, so it can't be told mid-flight); the entering
   * item reads the same live value instead of one frozen at its own creation so the two
   * ends of a transition are structurally guaranteed to agree, rather than being two
   * independently-computed values that happen to currently match. Bound on `.panel-body`
   * because — unlike its `.panel-content` children — it's never itself removed mid-switch,
   * so it stays live right up to the moment either animation starts.
   */
  protected readonly switchDir = computed(() => {
    const prevDesc = this.previousDescriptor();
    if (!prevDesc) {
      return 0;
    }

    const nextId = this.openPanel();
    const nextDesc = nextId ? this.registry.byId(nextId) : undefined;
    if (!nextDesc) {
      return 0;
    }

    return nextDesc.index > prevDesc.index ? -1 : nextDesc.index < prevDesc.index ? 1 : 0;
  });

  /** The header element, present only while a panel is open (it's inside the `@if`). */
  private readonly headerEl = viewChild<ElementRef<HTMLElement>>('header');

  /**
   * The header's rendered height, fed back into `.panel-content`'s `padding-top` (see
   * the template's `--panel-header-height` binding) so scrolled content starts below
   * the floating, transparent header rather than under it. Measured rather than a
   * fixed constant because the header's height (safe-area inset, per-skin spacing)
   * isn't knowable from CSS alone.
   */
  protected readonly headerHeight = signal(0);

  constructor() {
    // The focus-trap auto-capture moves focus into the panel on open, so without this
    // it would be lost to <body> once the panel closes.
    restoreFocusOn(() => this.openPanel() !== null);

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
