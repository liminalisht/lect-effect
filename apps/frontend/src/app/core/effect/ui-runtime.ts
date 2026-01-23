/**
 * Managed Effect runtime wiring for the UI layer.
 * @since 1.0.0
 */
import { DestroyRef, inject, Injectable } from '@angular/core';
import {
  type Effect, Either, type Exit, ManagedRuntime,
} from 'effect';
import { RAW_FRONTEND_CONFIG } from '../config/raw-frontend-config-token.js';
import { decodeFrontendConfigEither } from '../config/frontend-config.js';
import { makeAppLayer, type AppEnv } from './app-layer.js';

/**
 * Facade for running Effect programs within the Angular app lifecycle.
 * @since 1.0.0
 * @category Services
 */
@Injectable({ providedIn: 'root' })
export class UiRuntime {
  private readonly destroyRef = inject(DestroyRef);
  private readonly rawConfig = inject(RAW_FRONTEND_CONFIG);

  private readonly runtime = (() => {
    const decoded = decodeFrontendConfigEither(this.rawConfig);
    if (Either.isLeft(decoded)) {
      // hard-fail: config is a bootstrap invariant
      throw decoded.left;
    }

    return ManagedRuntime.make(makeAppLayer(decoded.right));
  })();

  constructor() {
    this.destroyRef.onDestroy(() => {
      void this.runtime.dispose();
    });
  }

  /**
   * Run an Effect and capture its Exit using the shared runtime.
   * @since 1.0.0
   */
  runExit = async <A, E, R extends AppEnv>(
    effect: Effect.Effect<A, E, R>,
  ): Promise<Exit.Exit<A, E>> => this.runtime.runPromiseExit(effect);

  /**
   * Run an Effect and resolve its success value using the shared runtime.
   * @since 1.0.0
   */
  runPromise = async <A, E, R extends AppEnv>(
    effect: Effect.Effect<A, E, R>,
  ): Promise<A> => this.runtime.runPromise(effect);
}
