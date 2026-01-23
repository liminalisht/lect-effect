import { computed, inject, Injectable, signal } from '@angular/core';
import { Cause, Effect, Exit } from 'effect';
import type { HelloResponse } from '@lect-effect/domain/hello/helloResponse';
import { remoteData, type RemoteData } from '../../core/effect/remote-data.js';
import { UiRuntime } from '../../core/effect/ui-runtime.js';
import { HelloApiService, type HelloApiError } from '../../../api/hello/hello.api.interface.js';

@Injectable()
export class HelloStore {
  private readonly runtime = inject(UiRuntime);
  private readonly name_ = signal<string>('');
  private readonly state_ = signal<RemoteData<Cause.Cause<HelloApiError>, HelloResponse>>(
    remoteData.initial<Cause.Cause<HelloApiError>, HelloResponse>(),
  );

  readonly name = this.name_.asReadonly();
  readonly state = this.state_.asReadonly();

  readonly greeting = computed(() => {
    const s = this.state_();
    return s._tag === 'Success' ? s.value.greeting : null;
  });

  setName(name: string): void {
    this.name_.set(name);
  }

  async run(): Promise<void> {
    this.state_.set(remoteData.loading<Cause.Cause<HelloApiError>, HelloResponse>());

    const raw = this.name_().trim();
    const payload = raw === '' ? null : raw;

    const program = Effect.gen(function* () {
      const api = yield* HelloApiService;
      return yield* api.greet(payload);
    });

    const exit = await this.runtime.runExit(program);

    this.state_.set(
      Exit.match(exit, {
        onFailure: cause =>
          remoteData.failure<Cause.Cause<HelloApiError>, HelloResponse>(cause),
        onSuccess: value =>
          remoteData.success<Cause.Cause<HelloApiError>, HelloResponse>(value),
      }),
    );
  }
}
