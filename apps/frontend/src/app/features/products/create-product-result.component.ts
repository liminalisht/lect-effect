/**
 * Result renderer for createProductWithItems remote data.
 * @since 1.0.0
 */
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import type {ProductWithItems} from '@lect-effect/domain/product/productWithItems';
import type {RemoteData} from '../../core/effect/remote-data.js';

@Component({
  selector: 'app-create-product-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './create-product-result.component.html',
  styleUrl: './create-product-result.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProductResultComponent {
  @Input({required: true}) state!: RemoteData<unknown, ProductWithItems>;
}
