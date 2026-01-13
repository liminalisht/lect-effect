import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { productDescriptionSchema } from '../../../src/domain/product/productDescription';

const decodeProductDescription = Schema.decodeUnknown(productDescriptionSchema);
const arbitraryProductDescription = Arbitrary.make(productDescriptionSchema);
const invalidProductDescription = fc.oneof(
  fc.integer(),
  fc.boolean(),
  fc.object(),
);

const validProductDescriptionProperty = fc.property(arbitraryProductDescription, value => {
  const decoded = Effect.runSync(decodeProductDescription(value));
  expect(decoded).toEqual(value);
});

const invalidProductDescriptionProperty = fc.property(invalidProductDescription, value => {
  expect(() => Effect.runSync(decodeProductDescription(value))).toThrow();
});

describe('productDescriptionSchema', () => {
  it.effect('decodes strings', () =>
    Effect.sync(() => {
      fc.assert(validProductDescriptionProperty);
    }));

  it.effect('rejects non-strings', () =>
    Effect.sync(() => {
      fc.assert(invalidProductDescriptionProperty);
    }));
});
