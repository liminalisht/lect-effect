/**
 * @since 1.0.0
 * @fileoverview Managed Effect runtime wiring for the UI layer.
 */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/**
 * Managed runtime used to run Effect programs with the app's GraphQL layer.
 * @since 1.0.0
 */
import {DestroyRef, Injectable} from '@angular/core';
import {
  Effect, Exit, ManagedRuntime,
} from 'effect';
import {GraphQLClientLive, type GraphQLClient} from '../graphql/graphql-client.js';

const AppLayer = GraphQLClientLive('/graphql');

/**
 * Managed runtime facade exposed to UI features.
 * @since 1.0.0
 */
@Injectable({providedIn: 'root'})
export class UiRuntime {
  private readonly runtime = ManagedRuntime.make(AppLayer);

  /**
   * Hooks the runtime lifecycle to the Angular injector destroy cycle.
   * @since 1.0.0
   */
  constructor(destroyRef: DestroyRef) {
    destroyRef.onDestroy(() => {
      void this.runtime.dispose();
    });
  }

  /**
   * Runs an Effect using the configured runtime and returns its Exit value.
   * @since 1.0.0
   */
  async runExit<A, E>(effect: Effect.Effect<A, E, GraphQLClient>): Promise<Exit.Exit<A, E>> {
    return this.runtime.runPromiseExit(effect);
  }
}
