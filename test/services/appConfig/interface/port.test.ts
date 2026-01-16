
import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { portSchema } from '../../../../src/services/appConfig/interface/port';

const decodePort = Schema.decodeUnknown(portSchema);
const arbitraryPort = Arbitrary.make(portSchema);

const validPortProperty = fc.property(arbitraryPort, port => {
  const decoded = Effect.runSync(decodePort(port));
  expect(decoded).toEqual(port);
});

const invalidPortProperty = fc.property(
  fc.oneof(
    fc.integer({ max: 1 - 1 }),
    fc.integer({ min: 65_535 + 1 }),
    fc.float({ noNaN: true, noDefaultInfinity: true }).filter(n => !Number.isInteger(n)),
  ),
  n => {
    expect(() => Effect.runSync(decodePort(n))).toThrow();
  },
);

describe('Port schema', () => {
  it.effect('decode valid ports', () =>
    Effect.sync(() => {
      fc.assert(validPortProperty);
    }));

  it.effect('reject ports that are out of range (1, 65535) or non-int values', () =>
    Effect.sync(() => {
      fc.assert(invalidPortProperty);
    }));
});
