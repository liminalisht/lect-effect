import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { nameSchema } from '../../src/domain/name';

const decodeName = Schema.decodeUnknown(nameSchema);
const arbitraryName = Arbitrary.make(nameSchema);

describe('Name schema', () => {
  it.effect('decodes strings', () =>
    Effect.sync(() => {
      fc.assert(
        fc.property(arbitraryName, name => {
          const decoded = Effect.runSync(decodeName(name));
          expect(decoded).toEqual(name);
        }),
      );
    })
  );

  it.effect('rejects non-strings', () =>
    Effect.sync(() => {
      const invalid = fc.anything().filter(value => typeof value !== 'string');

      fc.assert(
        fc.property(invalid, value => {
          expect(() => Effect.runSync(decodeName(value))).toThrow();
        }),
      );
    })
  );
});
