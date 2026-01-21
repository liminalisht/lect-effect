import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { productWithItemsSchema } from '@lect-effect/domain/product/productWithItems';
import { productSchema } from '@lect-effect/domain/product/product';
import { itemSchema } from '@lect-effect/domain/item/item';

const decodeProductWithItems = Schema.decodeUnknown(productWithItemsSchema);
const arbitraryProductWithItems = Arbitrary.make(productWithItemsSchema);
const invalidProductWithItems = fc.oneof(
  // missing items
  fc.record({ product: fc.record({ id: fc.integer(), description: fc.string() }, { requiredKeys: ['id', 'description'] }) }, { requiredKeys: ['product'] }),
  // items not array
  fc.record({ product: fc.record({ id: fc.integer(), description: fc.string() }, { requiredKeys: ['id', 'description'] }), items: fc.string() }, { requiredKeys: ['product', 'items'] }),
  // invalid item shape inside items (force at least one invalid element)
  fc.record({
    product: fc.record({ id: fc.integer(), description: fc.string() }, { requiredKeys: ['id', 'description'] }),
    items: fc.array(fc.record({ id: fc.string(), description: fc.string(), pack_size: fc.integer() }, { requiredKeys: ['id', 'description', 'pack_size'] }), { minLength: 1 }),
  }, { requiredKeys: ['product', 'items'] }),
  // invalid product shape
  fc.record({
    product: fc.record({ id: fc.string() }, { requiredKeys: ['id'] }),
    items: fc.array(fc.record({ id: fc.integer(), description: fc.string(), pack_size: fc.integer() }, { requiredKeys: ['id', 'description', 'pack_size'] })),
  }, { requiredKeys: ['product', 'items'] }),
  // non-object shapes
  fc.string(),
);

const validProductWithItemsProperty = fc.property(arbitraryProductWithItems, value => {
  const decoded = Effect.runSync(decodeProductWithItems(value));
  expect(decoded).toEqual(value);
});

const invalidProductWithItemsProperty = fc.property(invalidProductWithItems, value => {
  expect(() => Effect.runSync(decodeProductWithItems(value))).toThrow();
});

describe('productWithItemsSchema', () => {
  it.effect('decodes product aggregates with items', () =>
    Effect.sync(() => {
      fc.assert(validProductWithItemsProperty);
    }));

  it.effect('rejects invalid product or item payloads', () =>
    Effect.sync(() => {
      fc.assert(invalidProductWithItemsProperty);
    }));
});
