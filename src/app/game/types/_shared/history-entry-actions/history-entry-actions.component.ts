import { Component, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { IconButtonComponent } from '@ui/button/icon-button.component';

/**
 * Edit/delete icon-button pair for one history-list row. Shared between the
 * free-form and health-points history dialogs — the only two consumers of this
 * exact affordance today. Labels are inputs because "score" vs "change" differs
 * per game type; the icons and click wiring don't.
 */
@Component({
  selector: 'st-history-entry-actions',
  host: { 'st-layout': 'horizontal gap:xs' },
  imports: [NgIcon, IconButtonComponent],
  templateUrl: './history-entry-actions.component.html',
})
export class HistoryEntryActionsComponent {
  readonly editLabel = input.required<string>();
  readonly removeLabel = input.required<string>();

  readonly edit = output<void>();
  readonly remove = output<void>();
}
