import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/**
 * Shared heading for the score-entry surfaces — the inline turn card and the number
 * dialog. Lays out a player-colored user icon, the player's name, and a short line saying
 * what value is being added or edited (a category, a round, "Add Score", …).
 *
 * The icon reads `--st-player` from an ancestor `stPlayerColor` host rather than taking a
 * color of its own, so it always matches the surface it sits in. Centralizing the layout
 * here keeps the color and structure identical everywhere a score is entered.
 */
@Component({
  selector: 'st-score-entry-header',
  imports: [FontAwesomeModule],
  templateUrl: './score-entry-header.component.html',
  styleUrl: './score-entry-header.component.scss',
})
export class ScoreEntryHeaderComponent {
  /** Player whose value is being entered; their name leads the heading. */
  readonly name = input.required<string>();
  /** What the value is, shown beneath the name (e.g. a category, a round, "Add Score"). */
  readonly action = input.required<string>();
}
