import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { productIdInputSchema } from '@lect-effect/domain/product/productIdInput';

const decodeProductIdInput = Schema.decodeUnknown(productIdInputSchema);
const arbitraryProductIdInput = Arbitrary.make(productIdInputSchema);
const invalidProductIdInput = fc.oneof(
  fc.record({ id: fc.string() }, { requiredKeys: ['id'] }),
  fc.record({}, { requiredKeys: [] }),
  fc.string(),
);

const validProductIdInputProperty = fc.property(arbitraryProductIdInput, value => {
  const decoded = Effect.runSync(decodeProductIdInput(value));
  expect(decoded).toEqual(value);
});

const invalidProductIdInputProperty = fc.property(invalidProductIdInput, value => {
  expect(() => Effect.runSync(decodeProductIdInput(value))).toThrow();
});

describe('productIdInputSchema', () => {
  it.effect('decodes structs with integer ids', () =>
    Effect.sync(() => {
      fc.assert(validProductIdInputProperty);
    }));

  it.effect('rejects missing or invalid ids', () =>
    Effect.sync(() => {
      fc.assert(invalidProductIdInputProperty);
    }));
});
