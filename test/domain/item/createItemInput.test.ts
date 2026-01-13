import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { createItemInputSchema } from '../../../src/domain/item/createItemInput';

const decodeCreateItemInput = Schema.decodeUnknown(createItemInputSchema);
const arbitraryCreateItemInput = Arbitrary.make(createItemInputSchema);
const invalidCreateItemInput = fc.oneof(
  // pack_size is required and must be an int
  fc.record({ pack_size: fc.string() }, { requiredKeys: ['pack_size'] }),
  fc.record({ pack_size: fc.double({ noNaN: true, noDefaultInfinity: true }).filter(n => !Number.isInteger(n)) }, { requiredKeys: ['pack_size'] }),
  // bad description type
  fc.record({ description: fc.boolean(), pack_size: fc.integer() }, { requiredKeys: ['description', 'pack_size'] }),
  // non-object shapes
  fc.string(),
);

const validCreateItemInputProperty = fc.property(arbitraryCreateItemInput, value => {
  const decoded = Effect.runSync(decodeCreateItemInput(value));
  expect(decoded).toEqual(value);
});

const invalidCreateItemInputProperty = fc.property(invalidCreateItemInput, value => {
  expect(() => Effect.runSync(decodeCreateItemInput(value))).toThrow();
});

describe('createItemInputSchema', () => {
  it.effect('decodes item creation inputs', () =>
    Effect.sync(() => {
      fc.assert(validCreateItemInputProperty);
    }));

  it.effect('rejects missing or invalid fields', () =>
    Effect.sync(() => {
      fc.assert(invalidCreateItemInputProperty);
    }));
});
