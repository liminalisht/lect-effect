/**
 * @fileoverview Hello feature store that orchestrates greeting calls.
 * @since 1.0.0
 */
/* eslint-disable @typescript-eslint/member-ordering */
import {
  Injectable, computed, inject, signal,
} from '@angular/core';
import { Exit } from 'effect';
import type { HelloResponse } from '@lect-effect/domain/hello/helloResponse';
import { remoteData, type RemoteData } from '../../core/effect/remote-data.js';
import { UiRuntime } from '../../core/effect/ui-runtime.js';
import { greet } from '../../../api/hello.api.js';

/**
 * Store backing the Hello page; handles user input and maps Effect results to remote data.
 * @since 1.0.0
 */
@Injectable({ providedIn: 'root' })
export class HelloStore {
  private readonly runtime = inject(UiRuntime);
  private readonly name_ = signal<string>('');
  private readonly state_ = signal<RemoteData<unknown, HelloResponse>>(remoteData.initial());

  /**
   * Readonly view of the current name input.
   * @since 1.0.0
   */
  readonly name = this.name_.asReadonly();
  /**
   * Readonly view of the hello request remote data state.
   * @since 1.0.0
   */
  readonly state = this.state_.asReadonly();
  /**
   * Derived greeting when the remote data is successful.
   * @since 1.0.0
   */
  readonly greeting = computed(() => {
    const s = this.state_();
    return s._tag === 'Success' ? s.value.greeting : null;
  });

  /**
   * Sets the current name input value.
   * @since 1.0.0
   */
  setName(name: string): void {
    this.name_.set(name);
  }

  /**
   * Executes the greeting call and updates remote data state.
   * @since 1.0.0
   */
  async run(): Promise<void> {
    this.state_.set(remoteData.loading());

    const raw = this.name_().trim();
    const input = { name: raw === '' ? null : raw };

    const exit = await this.runtime.runExit(greet(input));

    if (Exit.isSuccess(exit)) {
      this.state_.set(remoteData.success(exit.value));
    } else {
      // keep it minimal: store the whole Cause as unknown (matches ToyStore’s strategy)
      this.state_.set(remoteData.failure(exit.cause));
    }
  }
}
