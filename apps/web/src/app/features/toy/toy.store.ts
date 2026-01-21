/* eslint-disable @typescript-eslint/consistent-type-imports */
import {Injectable, signal, type WritableSignal} from '@angular/core';
import {Effect, Exit} from 'effect';
import {remoteData, RemoteData} from '../../core/effect/remote-data.js';
import {UiRuntime} from '../../core/effect/ui-runtime.js';

@Injectable()
export class ToyStore {
  readonly state: WritableSignal<RemoteData<unknown, number>> = signal(remoteData.initial());

  constructor(private readonly runtime: UiRuntime) {}

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
