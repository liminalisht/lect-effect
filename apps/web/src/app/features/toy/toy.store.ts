import {Injectable, signal, type WritableSignal} from '@angular/core';
import {Effect, Exit} from 'effect';

import {RemoteData} from '../../core/effect/remote-data.js';
import {UiRuntime} from '../../core/effect/ui-runtime.js';

@Injectable()
export class ToyStore {
  readonly state: WritableSignal<RemoteData<unknown, number>> = signal(RemoteData.initial());

  constructor(private readonly runtime: UiRuntime) {}

  run(): void {
    this.state.set(RemoteData.loading());

    this.runtime
      .runExit(Effect.succeed(123))
      .then(exit => {
        if (Exit.isSuccess(exit)) {
          this.state.set(RemoteData.success(exit.value));
          return;
        }

        this.state.set(RemoteData.failure(exit.cause));
      })
      .catch(error => {
        this.state.set(RemoteData.failure(error));
      });
  }
}
