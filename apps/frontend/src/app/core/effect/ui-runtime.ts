// /**
//  * @since 1.0.0
//  * @fileoverview Managed Effect runtime wiring for the UI layer.
//  */
// /* eslint-disable @typescript-eslint/consistent-type-imports */
// /**
//  * Managed runtime used to run Effect programs with the app's GraphQL layer.
//  * @since 1.0.0
//  */
// import {DestroyRef, Injectable} from '@angular/core';
// import {
//   Effect, Exit, ManagedRuntime,
// } from 'effect';
// import {GraphQLClientLive, type GraphQLClient} from '../graphql/graphql-client.js';

// const AppLayer = GraphQLClientLive('/graphql');

// /**
//  * Managed runtime facade exposed to UI features.
//  * @since 1.0.0
//  */
// @Injectable({providedIn: 'root'})
// export class UiRuntime {
//   private readonly runtime = ManagedRuntime.make(AppLayer);

//   /**
//    * Hooks the runtime lifecycle to the Angular injector destroy cycle.
//    * @since 1.0.0
//    */
//   constructor(destroyRef: DestroyRef) {
//     destroyRef.onDestroy(() => {
//       void this.runtime.dispose();
//     });
//   }

//   /**
//    * Runs an Effect using the configured runtime and returns its Exit value.
//    * @since 1.0.0
//    */
//   async runExit<A, E>(effect: Effect.Effect<A, E, GraphQLClient>): Promise<Exit.Exit<A, E>> {
//     return this.runtime.runPromiseExit(effect);
//   }
// }
import { DestroyRef, inject, Injectable } from '@angular/core';
import {
  type Effect, Either, type Exit, ManagedRuntime,
} from 'effect';
import { RAW_FRONTEND_CONFIG } from '../config/raw-frontend-config-token.js';
import { decodeFrontendConfigEither } from '../config/frontend-config.js';
import { makeAppLayer, type AppEnv } from './app-layer.js';

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
      this.runtime.dispose();
    });
  }

  runExit = async <A, E, R extends AppEnv>(
    effect: Effect.Effect<A, E, R>,
  ): Promise<Exit.Exit<A, E>> => this.runtime.runPromiseExit(effect);

  runPromise = async <A, E, R extends AppEnv>(
    effect: Effect.Effect<A, E, R>,
  ): Promise<A> => this.runtime.runPromise(effect);
}
