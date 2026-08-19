import { Component } from '@angular/core';
import { NumberPadComponent } from '@ui/number-entry/number-pad/number-pad.component';
import { ScoreEntryHeaderComponent } from '@ui/number-entry/score-entry-header/score-entry-header.component';

/**
 * The Calculator panel's body: a card matching the per-round turn card
 * (`PlayerScoreComponent`), but standing in for a player with a calculator
 * icon and no action line. No `stColor` ancestor, so both the header band
 * and the pad wear the app's primary brand color rather than a player's;
 * `showEnter` is off on the pad since there's nothing to commit the tally to.
 */
@Component({
  selector: 'st-calculator-panel',
  imports: [NumberPadComponent, ScoreEntryHeaderComponent],
  templateUrl: './calculator-panel.component.html',
  styleUrl: './calculator-panel.component.scss',
})
export class CalculatorPanelComponent {}
