
import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { portSchema } from '../../src/domain/port';

const decodePort = Schema.decodeUnknown(portSchema);
const arbitraryPort = Arbitrary.make(portSchema);

describe('Port schema', () => {
  it.effect('decode valid ports', () =>
    Effect.sync(() => {
      // we can decode all valid ports
      fc.assert(fc.property(arbitraryPort, port => {
        const decoded = Effect.runSync(decodePort(port));
        expect(decoded).toEqual(port);
      }));
    }));

  it.effect('reject ports that are out of range (1, 65535) or non-int values', () =>
    Effect.sync(() => {
      // invalid ports: less than 1, greater than 65535, non-integers
      const invalid = fc.oneof(
        fc.integer({ max: 1 - 1 }),
        fc.integer({ min: 65_535 + 1 }),
        fc.float({ noNaN: true, noDefaultInfinity: true }).filter(n => !Number.isInteger(n)),
      );
      // invalid ports are rejected
      fc.assert(fc.property(invalid, n => {
        expect(() => Effect.runSync(decodePort(n))).toThrow();
      }));
    }));
});
