import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { nameSchema } from '../../../src/domain/hello/name';

const decodeName = Schema.decodeUnknown(nameSchema);
const arbitraryName = Arbitrary.make(nameSchema);
const invalidName = fc.anything().filter(value => typeof value !== 'string');

const validNameProperty = fc.property(arbitraryName, name => {
  const decoded = Effect.runSync(decodeName(name));
  expect(decoded).toEqual(name);
});

const invalidNameProperty = fc.property(invalidName, value => {
  expect(() => Effect.runSync(decodeName(value))).toThrow();
});

describe('Name schema', () => {
  it.effect('decodes strings', () =>
    Effect.sync(() => {
      fc.assert(validNameProperty);
    }));

  it.effect('rejects non-strings', () =>
    Effect.sync(() => {
      fc.assert(invalidNameProperty);
    }));
});
