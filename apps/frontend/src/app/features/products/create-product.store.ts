/**
 * Store orchestrating the createProductWithItems mutation.
 * @since 1.0.0
 */
import {Injectable, inject, signal} from '@angular/core';
import {Cause, Effect, Exit} from 'effect';
import type {ProductWithItems} from '@lect-effect/domain/product/productWithItems';
import {remoteData, type RemoteData} from '../../core/effect/remote-data.js';
import {UiRuntime} from '../../core/effect/ui-runtime.js';
import {ProductApiService, type ProductApiError} from '../../../api/product/product.api.interface.js';

/**
 * Feature store for product creation with associated items.
 * @since 1.0.0
 */
@Injectable()
export class CreateProductStore {
  /**
   * Remote data state for the view.
   * @since 1.0.0
   */
  readonly state = signal<RemoteData<Cause.Cause<ProductApiError>, ProductWithItems>>(
    remoteData.initial<Cause.Cause<ProductApiError>, ProductWithItems>(),
  );

  private readonly runtime = inject(UiRuntime);

  /**
   * Runs the createProductWithItems mutation and updates remote data.
   * @since 1.0.0
   */
  async create(input: unknown): Promise<void> {
    this.state.set(
      remoteData.loading<Cause.Cause<ProductApiError>, ProductWithItems>(),
    );

    const program = Effect.gen(function* () {
      const api = yield* ProductApiService;
      return yield* api.createProductWithItems(input);
    });

    const exit = await this.runtime.runExit(program);

    if (Exit.isSuccess(exit)) {
      this.state.set(
        remoteData.success<Cause.Cause<ProductApiError>, ProductWithItems>(exit.value),
      );
      return;
    }

    this.state.set(
      remoteData.failure<Cause.Cause<ProductApiError>, ProductWithItems>(exit.cause),
    );
  }
}
