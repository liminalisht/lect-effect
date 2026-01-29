/**
 * Composition page for creating a product with items.
 * @since 0.1.0
 */
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {type CreateProductWithItemsInput} from '@lect-effect/domain/product/createProductWithItemsInput';
import {CreateProductFormComponent} from './create-product-form.component.js';
import {CreateProductResultComponent} from './create-product-result.component.js';
import {CreateProductStore} from './create-product.store.js';

/**
 * Composition page that wires form, result, and store for product creation.
 * @since 0.1.0
 * @category Components
 */
@Component({
  selector: 'app-create-product-page',
  standalone: true,
  imports: [CommonModule, CreateProductFormComponent, CreateProductResultComponent],
  providers: [CreateProductStore],
  templateUrl: './create-product.page.html',
  styleUrl: './create-product.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProductPage {
  constructor(readonly store: CreateProductStore) {}

  /**
   * Handles form submit by delegating to the store.
   * @since 0.1.0
   * @category Methods
   */
  onSubmit(input: CreateProductWithItemsInput): void {
    void this.store.create(input);
  }
}
