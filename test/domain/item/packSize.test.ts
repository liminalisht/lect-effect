import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { packSizeSchema } from '../../../src/domain/item/packSize.js';

const decodePackSize = Schema.decodeUnknown(packSizeSchema);
const arbitraryPackSize = Arbitrary.make(packSizeSchema);
const invalidPackSize = fc.oneof(
  fc.double({ noNaN: true, noDefaultInfinity: true }).filter(n => !Number.isInteger(n)),
  fc.string(),
  fc.boolean(),
);

const validPackSizeProperty = fc.property(arbitraryPackSize, value => {
  const decoded = Effect.runSync(decodePackSize(value));
  expect(decoded).toEqual(value);
});

const invalidPackSizeProperty = fc.property(invalidPackSize, value => {
  expect(() => Effect.runSync(decodePackSize(value))).toThrow();
});

describe('packSizeSchema', () => {
  it.effect('decodes integer pack sizes', () =>
    Effect.sync(() => {
      fc.assert(validPackSizeProperty);
    }));

  it.effect('rejects non-integer or non-number values', () =>
    Effect.sync(() => {
      fc.assert(invalidPackSizeProperty);
    }));
});
