import { describe, expect } from 'vitest';
import { it } from '@effect/vitest';
import { Arbitrary, Effect, Schema } from 'effect';
import fc from 'fast-check';
import { portSchema } from '../../src/domain/port';

const decodePort = Schema.decodeUnknown(portSchema);
const portArb = Arbitrary.make(portSchema);

describe('Port schema', () => {
  it.effect('accepts valid ports', () =>
    Effect.sync(() => {
      fc.assert(
        fc.property(portArb, port => {
          const decoded = Effect.runSync(decodePort(port));
          expect(decoded).toEqual(port);
        }),
      );
    })
  );

  it.effect('rejects out-of-range or non-int values', () =>
    Effect.sync(() => {
      const invalid = fc.oneof(
        fc.integer({ max: 0 }),
        fc.integer({ min: 65_536 }),
        fc.float({ noNaN: true, noDefaultInfinity: true }).filter(n => !Number.isInteger(n)),
      );
      fc.assert(
        fc.property(invalid, n => {
          expect(() => Effect.runSync(decodePort(n))).toThrow();
        }),
      );
    })
  );

});
