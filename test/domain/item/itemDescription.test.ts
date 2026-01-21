import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { itemDescriptionSchema } from '@lect-effect/domain/item/itemDescription';

const decodeItemDescription = Schema.decodeUnknown(itemDescriptionSchema);
const arbitraryItemDescription = Arbitrary.make(itemDescriptionSchema);
const invalidItemDescription = fc.oneof(
  fc.integer(),
  fc.boolean(),
  fc.object(),
);

const validItemDescriptionProperty = fc.property(arbitraryItemDescription, value => {
  const decoded = Effect.runSync(decodeItemDescription(value));
  expect(decoded).toEqual(value);
});

const invalidItemDescriptionProperty = fc.property(invalidItemDescription, value => {
  expect(() => Effect.runSync(decodeItemDescription(value))).toThrow();
});

describe('itemDescriptionSchema', () => {
  it.effect('decodes nullable strings', () =>
    Effect.sync(() => {
      fc.assert(validItemDescriptionProperty);
    }));

  it.effect('rejects non-string and non-null values', () =>
    Effect.sync(() => {
      fc.assert(invalidItemDescriptionProperty);
    }));
});
