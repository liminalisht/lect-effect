import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { itemSchema } from '@lect-effect/domain/item/item';

const decodeItem = Schema.decodeUnknown(itemSchema);
const arbitraryItem = Arbitrary.make(itemSchema);
const invalidItem = fc.oneof(
  // wrong id type
  fc.record({ id: fc.string(), description: fc.string(), pack_size: fc.integer() }, { requiredKeys: ['id', 'description', 'pack_size'] }),
  // missing required fields
  fc.record({ id: fc.integer(), pack_size: fc.integer() }, { requiredKeys: ['id', 'pack_size'] }),
  // pack_size not integer
  fc.record(
    {
      id: fc.integer(),
      description: fc.string(),
      pack_size: fc.double({ noNaN: true, noDefaultInfinity: true }).filter(n => !Number.isInteger(n)),
    },
    { requiredKeys: ['id', 'description', 'pack_size'] },
  ),
  // non-object shapes
  fc.string(),
);

const validItemProperty = fc.property(arbitraryItem, value => {
  const decoded = Effect.runSync(decodeItem(value));
  expect(decoded).toEqual(value);
});

const invalidItemProperty = fc.property(invalidItem, value => {
  expect(() => Effect.runSync(decodeItem(value))).toThrow();
});

describe('itemSchema', () => {
  it.effect('decodes full item records', () =>
    Effect.sync(() => {
      fc.assert(validItemProperty);
    }));

  it.effect('rejects missing or invalid item shapes', () =>
    Effect.sync(() => {
      fc.assert(invalidItemProperty);
    }));
});
