import {
  phosphorBackspace,
  phosphorBook,
  phosphorCalculator,
  phosphorCaretDown,
  phosphorCaretUp,
  phosphorChartBar,
  phosphorChartLine,
  phosphorClockCounterClockwise,
  phosphorCopy,
  phosphorFloppyDisk,
  phosphorGridNine,
  phosphorHeart,
  phosphorHouse,
  phosphorInfo,
  phosphorKeyboard,
  phosphorLightbulb,
  phosphorLineSegments,
  phosphorPalette,
  phosphorPencilSimple,
  phosphorPlus,
  phosphorPlusMinus,
  phosphorRecycle,
  phosphorSkull,
  phosphorSword,
  phosphorTable,
  phosphorTrash,
  phosphorTrophy,
  phosphorUser,
  phosphorUserPlus,
  phosphorUsers,
  phosphorX,
} from '@ng-icons/phosphor-icons/regular';
// Filled twins, registered only for the glyphs that drive a toggle's active/open
// state (outline → filled). Everything else ships regular only, so the bundle
// stays tree-shaken.
import {
  phosphorBookFill,
  phosphorCalculatorFill,
  phosphorHouseFill,
  phosphorLightbulbFill,
  phosphorPaletteFill,
  phosphorUsersFill,
  phosphorTrophyFill,
  phosphorUserFill
} from '@ng-icons/phosphor-icons/fill';

/**
 * Every Phosphor glyph the app uses, keyed by the name templates reference via
 * `<ng-icon name="phosphorUser">`. Passed to ng-icons' `provideIcons` in
 * `app.config.ts`. Each icon is imported explicitly (inline SVG), so the build
 * stays tree-shaken — we never pull a webfont or the whole pack.
 *
 * Glyphs that back a toggle also register their `…Fill` twin so the shared
 * `stToggleIcon` convention can swap outline → filled for the open/active state.
 * Phosphor ships a consistent weight family for the whole set, so any glyph can
 * gain a twin here without hunting for a matching outline pair.
 *
 * The custom `score-tracker` brand logo is intentionally absent: it's a PNG (not
 * a Phosphor glyph), so the shell renders it directly as an `<img>` from the
 * existing PWA icon set in `public/icons/`.
 */
export const ICONS = {
  phosphorBackspace,
  phosphorBook,
  phosphorCalculator,
  phosphorCaretDown,
  phosphorCaretUp,
  phosphorChartBar,
  phosphorChartLine,
  phosphorClockCounterClockwise,
  phosphorCopy,
  phosphorFloppyDisk,
  phosphorGridNine,
  phosphorHeart,
  phosphorHouse,
  phosphorInfo,
  phosphorKeyboard,
  phosphorLightbulb,
  phosphorLineSegments,
  phosphorPalette,
  phosphorPencilSimple,
  phosphorPlus,
  phosphorPlusMinus,
  phosphorRecycle,
  phosphorSkull,
  phosphorSword,
  phosphorTable,
  phosphorTrash,
  phosphorTrophy,
  phosphorUser,
  phosphorUserPlus,
  phosphorUsers,
  phosphorX,
  // Toggle twins: filled weight for the open/active state.
  phosphorBookFill,
  phosphorCalculatorFill,
  phosphorHouseFill,
  phosphorLightbulbFill,
  phosphorPaletteFill,
  phosphorTrophyFill,
  phosphorUsersFill,
  phosphorUserFill,
};
