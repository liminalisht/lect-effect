/**
 * Store orchestrating the createProductWithItems mutation.
 * @since 1.0.0
 */
import {Injectable, inject, signal} from '@angular/core';
import {Exit} from 'effect';
import type {ProductWithItems} from '@lect-effect/domain/product/productWithItems';
import {remoteData, type RemoteData} from '../../core/effect/remote-data.js';
import {UiRuntime} from '../../core/effect/ui-runtime.js';
import {createProductWithItems} from '../../../api/product.api.js';

/**
 * Feature store for product creation with associated items.
 * @since 1.0.0
 */
@Injectable()
export class CreateProductStore {
  /** Remote data state for the view. */
  readonly state = signal<RemoteData<unknown, ProductWithItems>>(remoteData.initial());

  private readonly runtime = inject(UiRuntime);

  /** Runs the createProductWithItems mutation and updates remote data. */
  async create(input: unknown): Promise<void> {
    this.state.set(remoteData.loading());

    const exit = await this.runtime.runExit(createProductWithItems(input));

    if (Exit.isSuccess(exit)) {
      this.state.set(remoteData.success(exit.value));
      return;
    }

    this.state.set(remoteData.failure(exit.cause));
  }
}
