import {
  Component,
  Injector,
  computed,
  effect,
  inject,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Player } from '@models/player';
import { PlayerSelectionComponent } from '@forms/player-selection/player-selection.component';
import {
  GAME_CONFIG_CONTEXT,
  GAME_SESSION,
  GameConfigContext,
  GameSession,
  GameType,
} from '../game-type';
import { GameTypeRegistry } from '../game-type-registry';
import { GameSessionStore } from '../game-session-store';

/**
 * Generic host for `/play/:gameType`. Resolves the {@link GameType} descriptor from the
 * route (redirecting Home on an unknown id), runs the setup → game flow, and owns the
 * persistence wiring the per-round component used to own itself:
 *
 *   - **Resume:** on init, rehydrate any persisted session for this type.
 *   - **Setup:** player selection, then — only if the descriptor declares one — a config
 *     step rendered from `configComponent` and seeded from `defaultConfig()`.
 *   - **Game:** once a session is live, render the descriptor's `gameComponent`.
 *   - **Persist:** save the live session's snapshot on every change; clear it when the
 *     game ends (`reset()` flips `gameInitialized` → false).
 *
 * It assumes nothing about rounds/turns — all of that lives inside the concrete session.
 * The host stays mounted under the Saved Players overlay (a dialog), so an in-progress
 * game survives opening it, exactly as the per-round component did.
 */
@Component({
  selector: 'st-play-host',
  imports: [NgComponentOutlet, PlayerSelectionComponent],
  template: `
    <!-- Render nothing for an unknown id; the constructor has already kicked off the Home redirect. -->
    @if (descriptor) {
      @let active = session();
      @if (active && active.gameInitialized()) {
        <ng-container [ngComponentOutlet]="descriptor.gameComponent" [ngComponentOutletInjector]="gameInjector()" />
      } @else if (configInjector(); as injector) {
        <ng-container [ngComponentOutlet]="descriptor.configComponent!" [ngComponentOutletInjector]="injector" />
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

  /** The resolved descriptor, or `undefined` for an unknown id (the template renders nothing). */
  protected descriptor?: GameType;

  protected readonly session = signal<GameSession | null>(null);

  /** Players carried from step 1 into the optional config step (step 2). */
  private readonly pendingPlayers = signal<Player[] | null>(null);

  /** Child injector exposing the live session to the game component via {@link GAME_SESSION}. */
  protected readonly gameInjector = computed<Injector | undefined>(() => {
    const active = this.session();
    return active
      ? Injector.create({ providers: [{ provide: GAME_SESSION, useValue: active }], parent: this.injector })
      : undefined;
  });

  /** Child injector for the config step, or `null` when not in it. Seeds {@link GAME_CONFIG_CONTEXT}. */
  protected readonly configInjector = computed<Injector | null>(() => {
    const players = this.pendingPlayers();
    const descriptor = this.descriptor;
    if (!players || !descriptor?.configComponent) {
      return null;
    }
    const context: GameConfigContext = {
      players,
      config: descriptor.defaultConfig?.(),
      complete: (config) => this.startGame(descriptor, players, config),
      back: () => this.pendingPlayers.set(null),
    };
    return Injector.create({
      providers: [{ provide: GAME_CONFIG_CONTEXT, useValue: context }],
      parent: this.injector,
    });
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('gameType');
    const descriptor = id ? this.registry.byId(id) : undefined;
    if (!descriptor) {
      this.router.navigate(['']);
      return;
    }
    this.descriptor = descriptor;

    this.resume(descriptor);

    // Persist while a game is live; clear when it ends. Reading toSnapshot() inside the
    // live branch makes this effect track the session's state signals, so it re-saves on
    // every score change — the per-round service's old self-persist effect, now generic.
    effect(() => {
      const active = this.session();
      if (!active) {
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
    const descriptor = this.descriptor;
    if (!descriptor) {
      return;
    }
    if (descriptor.configComponent) {
      this.pendingPlayers.set(players);
    } else {
      this.startGame(descriptor, players, descriptor.defaultConfig?.());
    }
  }

  private startGame(descriptor: GameType, players: Player[], config: unknown): void {
    const session = runInInjectionContext(this.injector, () =>
      descriptor.createSession(players, config),
    );
    this.pendingPlayers.set(null);
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
