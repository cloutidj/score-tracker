import { InjectionToken } from '@angular/core';

/**
 * Injection tokens for {@link DialogService}-opened components. Typed `unknown` rather than
 * `any` (the project lints against `any`), so each call site casts to its own data/result
 * shape: `inject(DIALOG_DATA) as ConfirmDialogData`.
 */
export const DIALOG_DATA = new InjectionToken<unknown>('DIALOG_DATA');

/** The open dialog's {@link DialogRef}, injected by the dialog's own component. */
export const DIALOG_REF = new InjectionToken<unknown>('DIALOG_REF');
