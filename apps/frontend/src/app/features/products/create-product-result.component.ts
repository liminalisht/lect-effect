/**
 * Result renderer for createProductWithItems remote data.
 * @since 0.1.0
 */
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import type {ProductWithItems} from '@lect-effect/domain/product/productWithItems';
import type {RemoteData} from '../../core/effect/remote-data.js';

/**
 * Angular component rendering remote data from createProductWithItems.
 * @since 0.1.0
 * @category Components
 */
@Component({
  selector: 'app-create-product-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './create-product-result.component.html',
  styleUrl: './create-product-result.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProductResultComponent {
  /**
   * Remote data to render.
   * @since 0.1.0
   * @category Inputs
   */
  @Input({required: true}) state!: RemoteData<ProductWithItems, unknown>;
}
