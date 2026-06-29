import { Injectable, InjectionToken, Signal, computed, inject, signal } from '@angular/core';
import { DatabaseService } from '@util/database.service';
import { ScoringConfig } from './models/scoring-config';

const DB_KEY = 'EndGameScoringConfigs';

/**
 * Multi-provider token holding the code-provided built-in configs (see
 * `data/built-in-configs.ts`). Mirrors the `GAME_TYPE` convention: register a built-in in
 * `app.config.ts` without touching this store.
 */
export const BUILT_IN_SCORING_CONFIG = new InjectionToken<ScoringConfig[]>('BUILT_IN_SCORING_CONFIG');

/**
 * Registry of end-game scoring configurations: the read-only built-ins (provided via
 * {@link BUILT_IN_SCORING_CONFIG}) merged with the user's own configs, which persist as one
 * array through {@link DatabaseService}. The setup screen's rule-set dropdown lists `all()`;
 * the rule-set manager calls `save`/`duplicate`/`remove`. Signal-backed (like
 * `SavedPlayerService`) so the lists re-render the moment a config is saved or deleted.
 */
@Injectable({ providedIn: 'root' })
export class ScoringConfigStore {
  private readonly database = inject(DatabaseService);
  private readonly builtIns = inject(BUILT_IN_SCORING_CONFIG, { optional: true }) ?? [];
  private readonly _userConfigs = signal<ScoringConfig[]>(this.load());

  /** User-created configs only — the editable/removable ones. */
  readonly userConfigs: Signal<ScoringConfig[]> = this._userConfigs.asReadonly();

  /** Built-ins first, then the user's own. */
  readonly configs = computed<ScoringConfig[]>(() => [...this.builtIns, ...this._userConfigs()]);

  all(): ScoringConfig[] {
    return this.configs();
  }

  byId(id: string): ScoringConfig | undefined {
    return this.all().find((config) => config.id === id);
  }

  /**
   * Insert or update a user config. A config whose id isn't an existing *user* id is stored
   * as new with a generated id (so editing a copy of a built-in can never overwrite the
   * built-in); a matching user id updates in place. Always persisted with `builtIn: false`.
   * Returns the stored config (with its final id).
   */
  save(config: ScoringConfig): ScoringConfig {
    const stored: ScoringConfig = { ...config, builtIn: false };
    const isExistingUserConfig =
      !!stored.id && this._userConfigs().some((c) => c.id === stored.id);
    if (isExistingUserConfig) {
      this.database.update(DB_KEY, stored, (c: ScoringConfig) => c.id === stored.id);
    } else {
      stored.id = this.newId();
      this.database.add(DB_KEY, stored);
    }
    this.refresh();
    return stored;
  }

  /**
   * Clone an existing config (built-in or user) into a new *user* config named "… (copy)".
   * Returns the stored copy with its generated id, or `undefined` if `id` is unknown.
   */
  duplicate(id: string): ScoringConfig | undefined {
    const source = this.byId(id);
    if (!source) {
      return undefined;
    }
    const copy: ScoringConfig = {
      ...structuredClone(source),
      id: '',
      name: `${source.name} (copy)`,
      builtIn: false,
    };
    return this.save(copy);
  }

  remove(id: string): void {
    this.database.remove(DB_KEY, (c: ScoringConfig) => c.id === id);
    this.refresh();
  }

  private newId(): string {
    return `user:${crypto.randomUUID()}`;
  }

  private refresh(): void {
    this._userConfigs.set(this.load());
  }

  private load(): ScoringConfig[] {
    const data = this.database.get<ScoringConfig[]>(DB_KEY);
    if (!Array.isArray(data)) {
      this.database.save(DB_KEY, []);
      return [];
    }
    return data.map((config) => ({ ...config, builtIn: false }));
  }
}
