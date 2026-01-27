/**
 * Store backing the Hello feature page.
 * @since 1.0.0
 */
/* eslint-disable @typescript-eslint/member-ordering */
import {
  computed, inject, Injectable, signal,
} from '@angular/core';
import { type Cause, Effect, Exit } from 'effect';
import type { HelloResponse } from '@lect-effect/domain/hello/helloResponse';
import type { NameInput } from '@lect-effect/domain/hello/nameInput';
import { remoteData, type RemoteData } from '../../core/effect/remote-data.js';
import { UiRuntime } from '../../core/effect/ui-runtime.js';
import { HelloApiService, type HelloApiError } from '../../../api/hello/hello.api.interface.js';
import { type Signal, type WritableSignal } from '@angular/core';

/**
 * Feature store coordinating hello input and Effect execution.
 * @since 1.0.0
 * @category Stores
 */
@Injectable()
export class HelloStore {
  private readonly runtime: UiRuntime
    = inject(UiRuntime);
  private readonly name_: WritableSignal<string>
    = signal<string>('');
  private readonly state_: WritableSignal<RemoteData<HelloResponse, Cause.Cause<HelloApiError>>>
    = signal<RemoteData<HelloResponse, Cause.Cause<HelloApiError>>>(remoteData.initial<HelloResponse, Cause.Cause<HelloApiError>>());

  /**
   * Current input value as a readonly signal.
   * @since 1.0.0
   * @category Signals
   */
  readonly name: Signal<string>
    = this.name_.asReadonly();
  /**
   * Remote data state for the hello request.
   * @since 1.0.0
   * @category Signals
   */
  readonly state: Signal<RemoteData<HelloResponse, Cause.Cause<HelloApiError>>>
    = this.state_.asReadonly();

  /**
   * Derived greeting when available.
   * @since 1.0.0
   * @category Signals
   */
  readonly greeting: Signal<string | null> = computed(() => {
    const s = this.state_();
    return s._tag === 'Success' ? s.value.greeting : null;
  });

  /**
   * Update the name input.
   * @since 1.0.0
   * @category Methods
   */
  setName(name: string): void {
    this.name_.set(name);
  }

  /**
   * Execute the greet program and update remote data state.
   * @since 1.0.0
   * @category Methods
   */
  async run(): Promise<void> {
    this.state_.set(remoteData.loading<HelloResponse, Cause.Cause<HelloApiError>>());

    const raw: string = this.name_().trim();
    const payload: NameInput = {name: raw === '' ? null : raw};

    const program: Effect.Effect<HelloResponse, HelloApiError, HelloApiService> = Effect.gen(function * () {
      const api = yield * HelloApiService;
      return yield * api.greet(payload);
    });

    const exit = await this.runtime.runExit(program);

    this.state_.set(Exit.match(exit, {
      onFailure: cause =>
        remoteData.failure<HelloResponse, Cause.Cause<HelloApiError>>(cause),
      onSuccess: value =>
        remoteData.success<HelloResponse, Cause.Cause<HelloApiError>>(value),
    }));
  }
}
