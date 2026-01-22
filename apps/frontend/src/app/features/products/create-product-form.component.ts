/**
 * Standalone form component for creating a product with items (no Angular Forms).
 * @since 1.0.0
 */
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  signal,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Schema} from 'effect';
import {type CreateProductWithItemsInput} from '@lect-effect/domain/product/createProductWithItemsInput';
import {productDescriptionSchema} from '@lect-effect/domain/product/productDescription';
import {itemDescriptionSchema} from '@lect-effect/domain/item/itemDescription';
import {packSizeSchema} from '@lect-effect/domain/item/packSize';
import {
  schemaField,
  stringToInt,
  stringToNullIfBlank,
  type SchemaField,
} from '../../core/forms/schema-field.js';

type ItemDraft = {
  readonly description: SchemaField<string, string | null>;
  readonly packSize: SchemaField<string, number>;
};

const makeItemDraft = (): ItemDraft => ({
  description: schemaField({
    schema: itemDescriptionSchema,
    initialRaw: '',
    toUnknown: stringToNullIfBlank,
  }),
  packSize: schemaField({
    schema: packSizeSchema,
    initialRaw: '',
    toUnknown: stringToInt,
  }),
});

@Component({
  selector: 'app-create-product-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './create-product-form.component.html',
  styleUrl: './create-product-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProductFormComponent {
  @Output() readonly submitted = new EventEmitter<CreateProductWithItemsInput>();

  readonly productDescription = schemaField({
    schema: Schema.NullOr(productDescriptionSchema),
    initialRaw: '',
    toUnknown: stringToNullIfBlank,
  });

  readonly items = signal<ReadonlyArray<ItemDraft>>([makeItemDraft()]);

  readonly canSubmit = computed(() => {
    const drafts = this.items();
    return drafts.length > 0
      && this.productDescription.isValid()
      && drafts.every(draft => draft.description.isValid() && draft.packSize.isValid());
  });

  addItem(): void {
    this.items.update(items => [...items, makeItemDraft()]);
  }

  removeItem(index: number): void {
    this.items.update(items => {
      if (items.length <= 1) return items;
      return items.filter((_, i) => i !== index);
    });
  }

  onProductDescriptionInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.productDescription.setRaw(value);
  }

  onItemDescriptionInput(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const draft = this.items()[index];
    draft?.description.setRaw(value);
  }

  onItemPackSizeInput(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const draft = this.items()[index];
    draft?.packSize.setRaw(value);
  }

  submit(): void {
    if (!this.canSubmit()) return;

    const drafts = this.items();
    if (drafts.length === 0) return;

    const payload: CreateProductWithItemsInput = {
      product: {
        description: this.productDescription.value() ?? null,
      },
      items: drafts.map(draft => {
        const packSize = draft.packSize.value();
        if (packSize === null) {
          throw new Error('packSize missing despite validation');
        }

        return {
          description: draft.description.value() ?? null,
          pack_size: packSize,
        };
      }),
    };

    this.submitted.emit(payload);
  }
}
