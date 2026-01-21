/* eslint-disable @typescript-eslint/consistent-type-imports */
import {DestroyRef, Injectable} from '@angular/core';
import {
  Effect, Exit, ManagedRuntime,
} from 'effect';
import {GraphQLClientLive, type GraphQLClient} from '../graphql/graphql-client.js';

const AppLayer = GraphQLClientLive('/graphql');

@Injectable({providedIn: 'root'})
export class UiRuntime {
  private readonly runtime = ManagedRuntime.make(AppLayer);

  constructor(destroyRef: DestroyRef) {
    destroyRef.onDestroy(() => {
      void this.runtime.dispose();
    });
  }

  async runExit<A, E>(effect: Effect.Effect<A, E, GraphQLClient>): Promise<Exit.Exit<A, E>> {
    return this.runtime.runPromiseExit(effect);
  }
}
