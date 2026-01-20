import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { itemIdSchema } from '../../../src/domain/item/itemId.js';

const decodeItemId = Schema.decodeUnknown(itemIdSchema);
const arbitraryItemId = Arbitrary.make(itemIdSchema);
const invalidItemId = fc.oneof(
  fc.double({ noNaN: true, noDefaultInfinity: true }).filter(n => !Number.isInteger(n)),
  fc.string(),
  fc.boolean(),
);

const validItemIdProperty = fc.property(arbitraryItemId, value => {
  const decoded = Effect.runSync(decodeItemId(value));
  expect(decoded).toEqual(value);
});

const invalidItemIdProperty = fc.property(invalidItemId, value => {
  expect(() => Effect.runSync(decodeItemId(value))).toThrow();
});

describe('itemIdSchema', () => {
  it.effect('decodes integer item ids', () =>
    Effect.sync(() => {
      fc.assert(validItemIdProperty);
    }));

  it.effect('rejects non-integer or non-number values', () =>
    Effect.sync(() => {
      fc.assert(invalidItemIdProperty);
    }));
});
