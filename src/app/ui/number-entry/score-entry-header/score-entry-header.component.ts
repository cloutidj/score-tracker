import { Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

/**
 * Shared heading for the score-entry surfaces — the inline turn card, the number dialog,
 * and the player-less Calculator panel. Lays out a leading icon, a name, and an optional
 * short line saying what value is being added or edited (a category, a round, "Add
 * Score", …).
 *
 * The band reads `--st-player-color` from an ancestor `stColor` host rather than taking a
 * color of its own, so it always matches the surface it sits in; without one (the
 * Calculator panel) it falls back to the primary brand color. Centralizing the layout
 * here keeps the color and structure identical everywhere a score is entered.
 */
@Component({
  selector: 'st-score-entry-header',
  imports: [NgIcon],
  templateUrl: './score-entry-header.component.html',
  styleUrl: './score-entry-header.component.scss',
})
export class ScoreEntryHeaderComponent {
  /** Player (or other subject) whose value is being entered; leads the heading. */
  readonly name = input.required<string>();
  /** What the value is, shown beneath the name (e.g. a category, a round, "Add Score").
   *  Omitted for subjects with nothing to add (the Calculator panel). */
  readonly action = input<string | null>(null);
  /** Leading ng-icon name. Defaults to the generic player glyph. */
  readonly icon = input('phosphorUserFill');
}
