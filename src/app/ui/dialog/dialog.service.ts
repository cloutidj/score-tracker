import { inject, Injectable, Injector } from '@angular/core';
import { ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';
import { coerceArray } from '@angular/cdk/coercion';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { DialogRef } from './dialog-ref';
import { DIALOG_DATA, DIALOG_REF } from './dialog.tokens';

export interface DialogConfig<D = unknown> {
  data?: D;
  width?: string;
  maxWidth?: string;
  panelClass?: string | string[];
}

/**
 * Opens components as centered, focus-trapped modal dialogs on `@angular/cdk/overlay`. Focus
 * trap and restore use the same approach as `panel-host.component.ts`: a
 * `ConfigurableFocusTrapFactory` trap (the same mechanism `cdkTrapFocus` sugars over)
 * auto-captures focus into the dialog, and the element focused before `open()` is refocused
 * once it closes.
 *
 * Out of scope: `aria-live` open/close announcements, and any dedicated handling for nested
 * dialogs beyond plain trap-stacking (a dialog opened from another already stacks correctly —
 * each trap only cares about its own pane — but this isn't specially tested).
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly focusTrapFactory = inject(ConfigurableFocusTrapFactory);

  /** Open `component` in a new dialog, returning a `DialogRef` typed to its close result. */
  open<C, D = unknown, R = unknown>(
    component: ComponentType<C>,
    config: DialogConfig<D> = {},
  ): DialogRef<R> {
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      width: config.width,
      maxWidth: config.maxWidth ?? '95vw',
      // `st-dialog-enter` (`_motion.scss`) plays on its own the instant the pane is inserted —
      // no `animate.enter` needed, since dialogs attach outside any Angular template's
      // structural control flow. The matching leave class is added by `DialogRef.close()`.
      panelClass: ['st-dialog-enter', ...(config.panelClass ? coerceArray(config.panelClass) : [])],
    });

    const dialogRef = new DialogRef<R>(overlayRef, () => previouslyFocused?.focus());

    const dialogInjector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: DIALOG_REF, useValue: dialogRef },
        { provide: DIALOG_DATA, useValue: config.data },
      ],
    });

    const componentRef = overlayRef.attach(new ComponentPortal(component, null, dialogInjector));
    // The component's own host element sits between the pane (a flex container) and
    // its template's root — e.g. `<st-number-dialog>` wrapping `.st-dialog-surface`.
    // Left alone that host has no CSS of its own, so it shrink-wraps to content and
    // the surface's `width: 100%` (`_dialog.scss`) resolves against an indefinite
    // width instead of the pane's. `display: contents` drops the host from the box
    // tree so the surface becomes the pane's real flex item, sized by the pane
    // itself, for every dialog rather than needing a per-component `:host` rule.
    (componentRef.location.nativeElement as HTMLElement).style.display = 'contents';

    const focusTrap = this.focusTrapFactory.create(overlayRef.overlayElement);
    focusTrap.focusInitialElementWhenReady();

    overlayRef.backdropClick().subscribe(() => dialogRef.close());
    overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        dialogRef.close();
      }
    });
    dialogRef.afterClosed().subscribe(() => focusTrap.destroy());

    return dialogRef;
  }
}
