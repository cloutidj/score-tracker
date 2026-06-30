import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ConfirmService } from '@ui/confirm-dialog/confirm.service';
import { ScoringConfigStore } from '../scoring-config.store';
import { ScoringConfig } from '../models/scoring-config';
import {
  ScoringConfigBuilderComponent,
  ScoringConfigBuilderData,
} from '../config-builder/scoring-config-builder.component';

/**
 * Rule-set repository editor (mirrors the Saved Players list): lists the store's configs —
 * built-ins are read-only with a Duplicate action, user configs get Edit and Delete —
 * and a Create new button. Create/Edit/Duplicate open the builder dialog; Delete confirms
 * first. Opened from the always-available toolbar manager; edits flow through the store's
 * signal-backed lists wherever they're shown (the setup screen's rule-set dropdown).
 */
@Component({
  selector: 'st-scoring-config-manager',
  imports: [MatButtonModule, MatCardModule, FontAwesomeModule],
  templateUrl: './scoring-config-manager.component.html',
  styleUrl: './scoring-config-manager.component.scss',
})
export class ScoringConfigManagerComponent {
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  protected readonly store = inject(ScoringConfigStore);

  protected readonly configs = this.store.configs;

  create(): void {
    this.openBuilder(null);
  }

  edit(config: ScoringConfig): void {
    this.openBuilder(config);
  }

  duplicate(config: ScoringConfig): void {
    const copy = this.store.duplicate(config.id);
    if (copy) {
      this.openBuilder(copy);
    }
  }

  remove(config: ScoringConfig): void {
    this.confirm
      .ask({
        title: 'Delete rule set',
        message: `Delete "${config.name}"? This can't be undone.`,
        confirmLabel: 'Delete',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.store.remove(config.id);
        }
      });
  }

  private openBuilder(config: ScoringConfig | null): void {
    const data: ScoringConfigBuilderData = { config };
    this.dialog.open(ScoringConfigBuilderComponent, { data, width: '34rem', maxWidth: '95vw' });
  }
}
