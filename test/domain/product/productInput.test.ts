import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { productInputSchema } from '../../../src/domain/product/productInput.js';

const decodeProductInput = Schema.decodeUnknown(productInputSchema);
const arbitraryProductInput = Arbitrary.make(productInputSchema);
const invalidProductInput = fc.oneof(
  fc.record({ description: fc.integer() }, { requiredKeys: ['description'] }),
  fc.record({ description: fc.boolean() }, { requiredKeys: ['description'] }),
  // non-object shapes
  fc.string(),
  fc.integer(),
);

const validProductInputProperty = fc.property(arbitraryProductInput, value => {
  const decoded = Effect.runSync(decodeProductInput(value));
  expect(decoded).toEqual(value);
});

const invalidProductInputProperty = fc.property(invalidProductInput, value => {
  expect(() => Effect.runSync(decodeProductInput(value))).toThrow();
});

describe('productInputSchema', () => {
  it.effect('decodes product mutation inputs', () =>
    Effect.sync(() => {
      fc.assert(validProductInputProperty);
    }));

  it.effect('rejects invalid descriptions and shapes', () =>
    Effect.sync(() => {
      fc.assert(invalidProductInputProperty);
    }));
});
