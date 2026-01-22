/**
 * Composition page for creating a product with items.
 * @since 1.0.0
 */
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {type CreateProductWithItemsInput} from '@lect-effect/domain/product/createProductWithItemsInput';
import {CreateProductFormComponent} from './create-product-form.component.js';
import {CreateProductResultComponent} from './create-product-result.component.js';
import {CreateProductStore} from './create-product.store.js';

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

  onSubmit(input: CreateProductWithItemsInput): void {
    void this.store.create(input);
  }
}
