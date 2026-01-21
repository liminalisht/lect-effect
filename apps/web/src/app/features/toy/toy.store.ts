/**
 * @since 1.0.0
 * @fileoverview Toy feature store wiring effect state into signals.
 */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import {Injectable, signal, type WritableSignal} from '@angular/core';
import {Effect, Exit} from 'effect';
import {remoteData, RemoteData} from '../../core/effect/remote-data.js';
import {UiRuntime} from '../../core/effect/ui-runtime.js';

/**
 * Toy feature store that runs an Effect and maps it to remote data state.
 * @since 1.0.0
 */
@Injectable()
export class ToyStore {
  /**
   * Remote data state reflected into the view.
   * @since 1.0.0
   */
  readonly state: WritableSignal<RemoteData<unknown, number>> = signal(remoteData.initial());

  constructor(private readonly runtime: UiRuntime) {}

  /**
   * Runs the example effect and updates the remote data signal.
   * @since 1.0.0
   */
  run(): void {
    this.state.set(remoteData.loading());

    void (async () => {
      try {
        const exit = await this.runtime.runExit(Effect.succeed(123));

        if (Exit.isSuccess(exit)) {
          this.state.set(remoteData.success(exit.value));
          return;
        }

        this.state.set(remoteData.failure(exit.cause));
      } catch (error: unknown) {
        this.state.set(remoteData.failure(error));
      }
    })();
  }
}
