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

/**
 * Angular standalone form component for creating a product with items.
 * @since 1.0.0
 */
@Component({
  selector: 'app-create-product-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './create-product-form.component.html',
  styleUrl: './create-product-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProductFormComponent {
  /**
   * Emits validated create-product payloads.
   * @since 1.0.0
   */
  @Output() readonly submitted = new EventEmitter<CreateProductWithItemsInput>();

  /**
   * Field for the optional product description (blank → null).
   * @since 1.0.0
   */
  readonly productDescription = schemaField({
    schema: Schema.NullOr(productDescriptionSchema),
    initialRaw: '',
    toUnknown: stringToNullIfBlank,
  });

  /**
   * Draft items being edited in the form.
   * @since 1.0.0
   */
  readonly items = signal<readonly ItemDraft[]>([makeItemDraft()]);

  /**
   * Whether the form is currently valid and can be submitted.
   * @since 1.0.0
   */
  readonly canSubmit = computed(() => {
    const drafts = this.items();
    return drafts.length > 0
      && this.productDescription.isValid()
      && drafts.every(draft => draft.description.isValid() && draft.packSize.isValid());
  });

  /**
   * Adds a blank item draft row.
   * @since 1.0.0
   */
  addItem(): void {
    this.items.update(items => [...items, makeItemDraft()]);
  }

  /**
   * Removes an item draft by index (keeps at least one row).
   * @since 1.0.0
   */
  removeItem(index: number): void {
    this.items.update(items => {
      if (items.length <= 1) {
        return items;
      }

      return items.filter((_, i) => i !== index);
    });
  }

  /**
   * Handles product description edits.
   * @since 1.0.0
   */
  onProductDescriptionInput(event: Event): void {
    const {value} = (event.target as HTMLInputElement);
    this.productDescription.setRaw(value);
  }

  /**
   * Handles item description edits.
   * @since 1.0.0
   */
  onItemDescriptionInput(index: number, event: Event): void {
    const {value} = (event.target as HTMLInputElement);
    const draft = this.items()[index];
    draft?.description.setRaw(value);
  }

  /**
   * Handles item pack size edits.
   * @since 1.0.0
   */
  onItemPackSizeInput(index: number, event: Event): void {
    const {value} = (event.target as HTMLInputElement);
    const draft = this.items()[index];
    draft?.packSize.setRaw(value);
  }

  /**
   * Emits a validated payload when the draft is valid.
   * @since 1.0.0
   */
  submit(): void {
    if (!this.canSubmit()) {
      return;
    }

    const drafts = this.items();
    if (drafts.length === 0) {
      return;
    }

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
