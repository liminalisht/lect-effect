import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { itemIdInputSchema } from '../../../src/domain/item/itemIdInput';

const decodeItemIdInput = Schema.decodeUnknown(itemIdInputSchema);
const arbitraryItemIdInput = Arbitrary.make(itemIdInputSchema);
const invalidItemIdInput = fc.oneof(
  fc.record({ id: fc.string() }, { requiredKeys: ['id'] }),
  fc.record({}, { requiredKeys: [] }),
  fc.string(),
);

const validItemIdInputProperty = fc.property(arbitraryItemIdInput, value => {
  const decoded = Effect.runSync(decodeItemIdInput(value));
  expect(decoded).toEqual(value);
});

const invalidItemIdInputProperty = fc.property(invalidItemIdInput, value => {
  expect(() => Effect.runSync(decodeItemIdInput(value))).toThrow();
});

describe('itemIdInputSchema', () => {
  it.effect('decodes structs with integer ids', () =>
    Effect.sync(() => {
      fc.assert(validItemIdInputProperty);
    }));

  it.effect('rejects missing or invalid ids', () =>
    Effect.sync(() => {
      fc.assert(invalidItemIdInputProperty);
    }));
});
