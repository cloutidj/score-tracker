/**
 * The application's color model, as plain JSON-safe data. Behavior lives on
 * {@link ColorHelper} (a static helper) rather than on the instance, so a color read back
 * from storage (`JSON.parse`) is already fully usable — no rehydration step, and the
 * persisted shape *is* the runtime shape.
 */
export interface StColor {
  red: number;
  green: number;
  blue: number;
  /** Optional label; the preset palette names its colors, but a custom color may have none. */
  name?: string;
}
