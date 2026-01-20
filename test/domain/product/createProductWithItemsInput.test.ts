import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { createProductWithItemsInputSchema } from '../../../src/domain/product/createProductWithItemsInput.js';
import { createItemInputSchema } from '../../../src/domain/item/createItemInput.js';
import { productInputSchema } from '../../../src/domain/product/productInput.js';

const decodeCreateProductWithItemsInput = Schema.decodeUnknown(createProductWithItemsInputSchema);
const arbitraryCreateProductWithItemsInput = Arbitrary.make(createProductWithItemsInputSchema);
const invalidCreateProductWithItemsInput = fc.oneof(
  // product missing
  fc.record({ items: fc.array(fc.record({ pack_size: fc.integer() }, { requiredKeys: ['pack_size'] })) }, { requiredKeys: ['items'] }),
  // items not an array
  fc.record(
    { product: fc.record({ description: fc.string() }, { requiredKeys: ['description'] }), items: fc.string() },
    { requiredKeys: ['product', 'items'] },
  ),
  // items array with invalid element shape
  fc.record(
    { product: fc.record({ description: fc.string() }, { requiredKeys: ['description'] }), items: fc.array(fc.record({ pack_size: fc.string() }, { requiredKeys: ['pack_size'] }), { minLength: 1 }) },
    { requiredKeys: ['product', 'items'] },
  ),
  // product invalid type
  fc.record(
    { product: fc.record({ description: fc.boolean() }, { requiredKeys: ['description'] }), items: fc.array(fc.record({ pack_size: fc.integer() }, { requiredKeys: ['pack_size'] })) },
    { requiredKeys: ['product', 'items'] },
  ),
  // non-object shapes
  fc.string(),
);

const validCreateProductWithItemsInputProperty = fc.property(arbitraryCreateProductWithItemsInput, value => {
  const decoded = Effect.runSync(decodeCreateProductWithItemsInput(value));
  expect(decoded).toEqual(value);
});

const invalidCreateProductWithItemsInputProperty = fc.property(invalidCreateProductWithItemsInput, value => {
  expect(() => Effect.runSync(decodeCreateProductWithItemsInput(value))).toThrow();
});

describe('createProductWithItemsInputSchema', () => {
  it.effect('decodes product-with-items creation inputs', () =>
    Effect.sync(() => {
      fc.assert(validCreateProductWithItemsInputProperty);
    }));

  it.effect('rejects missing or invalid product/item payloads', () =>
    Effect.sync(() => {
      fc.assert(invalidCreateProductWithItemsInputProperty);
    }));
});
