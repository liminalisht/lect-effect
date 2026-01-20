import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { productSchema } from '../../../src/domain/product/product.js';

const decodeProduct = Schema.decodeUnknown(productSchema);
const arbitraryProduct = Arbitrary.make(productSchema);
const invalidProduct = fc.oneof(
  // wrong id type
  fc.record({ id: fc.string(), description: fc.string() }, { requiredKeys: ['id', 'description'] }),
  // missing required id
  fc.record({ description: fc.string() }, { requiredKeys: ['description'] }),
  // description wrong type
  fc.record({ id: fc.integer(), description: fc.boolean() }, { requiredKeys: ['id', 'description'] }),
  // __typename wrong literal
  fc.record({ id: fc.integer(), description: fc.string(), __typename: fc.string().filter(s => s !== 'Product') }, { requiredKeys: ['id', 'description', '__typename'] }),
  // non-object shapes
  fc.string(),
);

const validProductProperty = fc.property(arbitraryProduct, value => {
  const decoded = Effect.runSync(decodeProduct(value));
  expect(decoded).toEqual(value);
});

const invalidProductProperty = fc.property(invalidProduct, value => {
  expect(() => Effect.runSync(decodeProduct(value))).toThrow();
});

describe('productSchema', () => {
  it.effect('decodes persisted product records', () =>
    Effect.sync(() => {
      fc.assert(validProductProperty);
    }));

  it.effect('rejects missing or invalid product shapes', () =>
    Effect.sync(() => {
      fc.assert(invalidProductProperty);
    }));
});
