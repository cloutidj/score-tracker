import {
  Component,
  Injector,
  computed,
  effect,
  inject,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { NgComponentOutlet } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Player } from '@player/models/player';
import { PlayerSelectionComponent } from '@player/player-selection/player-selection.component';
import { GAME_SESSION, GameSession } from '@game/game-session';
import { GAME_SETUP_CONTEXT, GameSetupContext } from '@game/game-setup-context';
import { GameType } from '@game/game-type';
import { GameTypeRegistry } from '@game/game-type-registry';
import { GameSessionStore } from '@game/game-session-store';
import { LastGameTypeService } from '@core/last-game-type.service';

/**
 * Generic host for `/play/:gameType`. Resolves the {@link GameType} descriptor from the
 * route (redirecting Home on an unknown id), runs the setup → game flow, and owns the
 * session persistence wiring:
 *
 *   - **Resume:** whenever the resolved descriptor changes, rehydrate any persisted
 *     session for that type.
 *   - **Setup:** if the descriptor declares a `setupComponent`, render it (it owns its whole
 *     setup screen and launches via `GAME_SETUP_CONTEXT`); otherwise render the default
 *     `st-player-selection` and start with an `undefined` config.
 *   - **Game:** once a session is live, render the descriptor's `gameComponent`.
 *   - **Persist:** save the live session's snapshot on every change; clear it when the
 *     game ends (`reset()` flips `gameInitialized` → false).
 *
 * It assumes nothing about rounds/turns — all of that lives inside the concrete session.
 * The host stays mounted under the panel-host overlay, so an in-progress game survives
 * opening a panel.
 *
 * **Reacts to the `gameType` param rather than reading it once.** The Home panel can
 * navigate straight from `/play/:a` to `/play/:b` without leaving this route's config, and
 * Angular's default `RouteReuseStrategy` reuses the same component instance across a
 * same-route param change — so `descriptor` and `resume()` must re-derive from the param
 * signal, not a one-time constructor read, or switching game types from Home would keep
 * showing the previous game type's live session.
 */
@Component({
  selector: 'st-play-host',
  imports: [NgComponentOutlet, PlayerSelectionComponent],
  template: `
    <!-- Render nothing for an unknown id; the effect below has already kicked off the Home redirect. -->
    @if (descriptor(); as descriptor) {
      @let active = session();
      @if (active && active.gameInitialized()) {
        <ng-container [ngComponentOutlet]="descriptor.gameComponent" [ngComponentOutletInjector]="gameInjector()" />
      } @else if (setupInjector(); as injector) {
        <ng-container [ngComponentOutlet]="descriptor.setupComponent!" [ngComponentOutletInjector]="injector" />
      } @else {
        <st-player-selection (selectPlayers)="onPlayersSelected($event)" />
      }
    }
  `,
})
export class PlayHostComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly registry = inject(GameTypeRegistry);
  private readonly store = inject(GameSessionStore);
  private readonly injector = inject(Injector);
  private readonly lastGameType = inject(LastGameTypeService);

  private readonly gameTypeId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('gameType'))),
  );

  /** The resolved descriptor for the current `gameType` param, or `undefined` for an
   *  unknown id (the template renders nothing; the effect below redirects Home). */
  protected readonly descriptor = computed<GameType | undefined>(() => {
    const id = this.gameTypeId();
    return id ? this.registry.byId(id) : undefined;
  });

  protected readonly session = signal<GameSession | null>(null);

  /** Child injector exposing the live session to the game component via {@link GAME_SESSION}. */
  protected readonly gameInjector = computed<Injector | undefined>(() => {
    const active = this.session();
    return active
      ? Injector.create({ providers: [{ provide: GAME_SESSION, useValue: active }], parent: this.injector })
      : undefined;
  });

  /**
   * Child injector for a self-owned setup screen, or `null` when the descriptor has none (the
   * host then renders the default player selection). Seeds {@link GAME_SETUP_CONTEXT} so the
   * setup component can launch the game with the players and config it gathered.
   */
  protected readonly setupInjector = computed<Injector | null>(() => {
    const descriptor = this.descriptor();
    if (!descriptor?.setupComponent) {
      return null;
    }
    const context: GameSetupContext = {
      start: (players, config) => this.startGame(descriptor, players, config),
    };
    return Injector.create({
      providers: [{ provide: GAME_SETUP_CONTEXT, useValue: context }],
      parent: this.injector,
    });
  });

  constructor() {
    // Re-derive everything whenever the resolved descriptor changes (a fresh activation
    // OR a same-route param change to a different game type): remember it as last-played,
    // drop the previous type's session, and try to resume this type's own.
    effect(() => {
      const descriptor = this.descriptor();
      if (!descriptor) {
        this.router.navigate(['']);
        return;
      }
      this.lastGameType.set(descriptor.id);
      this.session.set(null);
      this.resume(descriptor);
    });

    // Persist while a game is live; clear when it ends. Reading toSnapshot() inside the
    // live branch makes this effect track the session's state signals, so it re-saves on
    // every score change.
    effect(() => {
      const descriptor = this.descriptor();
      const active = this.session();
      if (!descriptor || !active) {
        return;
      }
      if (active.gameInitialized()) {
        this.store.save(descriptor.id, active.toSnapshot());
      } else {
        this.store.clear(descriptor.id);
      }
    });
  }

  protected onPlayersSelected(players: Player[]): void {
    const descriptor = this.descriptor();
    if (descriptor) {
      this.startGame(descriptor, players, undefined);
    }
  }

  private startGame(descriptor: GameType, players: Player[], config: unknown): void {
    const session = runInInjectionContext(this.injector, () =>
      descriptor.createSession(players, config),
    );
    this.session.set(session);
  }

  /** Rehydrate a persisted game for this type; on corrupt data, clear it and start fresh. */
  private resume(descriptor: GameType): void {
    const snapshot = this.store.read(descriptor.id);
    if (snapshot == null) {
      return;
    }
    try {
      const restored = runInInjectionContext(this.injector, () =>
        descriptor.restoreSession(snapshot),
      );
      if (restored) {
        this.session.set(restored);
      } else {
        this.store.clear(descriptor.id);
      }
    } catch {
      this.store.clear(descriptor.id);
    }
  }
}
