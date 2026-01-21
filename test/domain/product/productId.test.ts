import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { productIdSchema } from '@lect-effect/domain/product/productId';

const decodeProductId = Schema.decodeUnknown(productIdSchema);
const arbitraryProductId = Arbitrary.make(productIdSchema);
const invalidProductId = fc.oneof(
  fc.double({ noNaN: true, noDefaultInfinity: true }).filter(n => !Number.isInteger(n)),
  fc.string(),
  fc.boolean(),
);

const validProductIdProperty = fc.property(arbitraryProductId, value => {
  const decoded = Effect.runSync(decodeProductId(value));
  expect(decoded).toEqual(value);
});

const invalidProductIdProperty = fc.property(invalidProductId, value => {
  expect(() => Effect.runSync(decodeProductId(value))).toThrow();
});

describe('productIdSchema', () => {
  it.effect('decodes integer product ids', () =>
    Effect.sync(() => {
      fc.assert(validProductIdProperty);
    }));

  it.effect('rejects non-integer or non-number values', () =>
    Effect.sync(() => {
      fc.assert(invalidProductIdProperty);
    }));
});
