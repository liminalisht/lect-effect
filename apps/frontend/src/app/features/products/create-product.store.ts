/**
 * Store orchestrating the createProductWithItems mutation.
 * @since 0.1.0
 */
import {Injectable, inject, signal} from '@angular/core';
import {type Cause, Effect, Exit} from 'effect';
import type {ProductWithItems} from '@lect-effect/domain/product/productWithItems';
import {remoteData, type RemoteData} from '../../core/effect/remote-data.js';
import {UiRuntime} from '../../core/effect/ui-runtime.js';
import {ProductApiService, type ProductApiError} from '../../../api/product/product.api.interface.js';

/**
 * Feature store for product creation with associated items.
 * @since 0.1.0
 * @category Stores
 */
@Injectable()
export class CreateProductStore {
  /**
   * Remote data state for the view.
   * @since 0.1.0
   * @category Signals
   */
  readonly state = signal<RemoteData<ProductWithItems, Cause.Cause<ProductApiError>>>(remoteData.initial<ProductWithItems, Cause.Cause<ProductApiError>>());

  private readonly runtime = inject(UiRuntime);

  /**
   * Runs the createProductWithItems mutation and updates remote data.
   * @since 0.1.0
   * @category Methods
   */
  async create(input: unknown): Promise<void> {
    this.state.set(remoteData.loading<ProductWithItems, Cause.Cause<ProductApiError>>());

    const program = Effect.gen(function * () {
      const api = yield * ProductApiService;
      return yield * api.createProductWithItems(input);
    });

    const exit = await this.runtime.runExit(program);

    if (Exit.isSuccess(exit)) {
      this.state.set(remoteData.success<ProductWithItems, Cause.Cause<ProductApiError>>(exit.value));
      return;
    }

    this.state.set(remoteData.failure<ProductWithItems, Cause.Cause<ProductApiError>>(exit.cause));
  }
}
