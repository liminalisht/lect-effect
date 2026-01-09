import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { nameInputSchema } from '../../src/domain/nameInput';

const decodeNameInput = Schema.decodeUnknown(nameInputSchema);
const arbitraryNameInput = Arbitrary.make(nameInputSchema);

describe('NameInput schema', () => {
  it.effect('decodes structs with optional name', () =>
    Effect.sync(() => {
      fc.assert(
        fc.property(arbitraryNameInput, value => {
          const decoded = Effect.runSync(decodeNameInput(value));
          expect(decoded).toEqual(value);
        }),
      );
    })
  );

  it.effect('rejects invalid name shapes', () =>
    Effect.sync(() => {
      const invalid = fc.oneof(
        // object with name present but not string/null/undefined
        fc.record({ name: fc.integer() }, { requiredKeys: ['name'] }),
        fc.record({ name: fc.boolean() }, { requiredKeys: ['name'] }),
        // non-object shapes
        fc.integer(),
        fc.boolean(),
      );

      fc.assert(
        fc.property(invalid, value => {
          expect(() => Effect.runSync(decodeNameInput(value))).toThrow();
        }),
      );
    })
  );
});
