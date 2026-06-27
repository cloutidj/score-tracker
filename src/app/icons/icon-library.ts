import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faAngleDown,
  faAngleUp,
  faChartBar,
  faChartLine,
  faCircleCheck,
  faCircleExclamation,
  faFloppyDisk,
  faKeyboard,
  faMoon,
  faPlus,
  faSun,
  faUser,
  faUsers,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

/**
 * Registers every Font Awesome glyph the app uses with the shared
 * `FaIconLibrary`. Each icon is imported explicitly (SVG/component mode), so the
 * build stays tree-shaken — we never pull the FA CSS/webfont. Adding them to the
 * library lets templates reference an icon by name (e.g. `<fa-icon icon="user">`)
 * instead of importing the `IconDefinition` into every component.
 *
 * The custom `score-tracker` brand logo is intentionally absent: it's a PNG
 * (not a real FA glyph), so the shell renders it directly as an `<img>` from
 * the existing PWA icon set in `public/icons/`.
 */
export function registerIcons(library: FaIconLibrary): void {
  library.addIcons(
    faAngleDown,
    faAngleUp,
    faChartBar,
    faChartLine,
    faCircleCheck,
    faCircleExclamation,
    faFloppyDisk,
    faKeyboard,
    faMoon,
    faPlus,
    faSun,
    faUser,
    faUsers,
    faXmark,
  );
}
