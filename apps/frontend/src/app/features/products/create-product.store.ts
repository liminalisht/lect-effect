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
  private readonly runtime = inject(UiRuntime);
  private readonly state_ = signal<RemoteData<unknown, ProductWithItems>>(remoteData.initial());

  /** Readonly remote data state for the view. */
  readonly state = this.state_.asReadonly();

  /** Runs the createProductWithItems mutation and updates remote data. */
  async create(input: unknown): Promise<void> {
    this.state_.set(remoteData.loading());

    const exit = await this.runtime.runExit(createProductWithItems(input));

    if (Exit.isSuccess(exit)) {
      this.state_.set(remoteData.success(exit.value));
      return;
    }

    this.state_.set(remoteData.failure(exit.cause));
  }
}
