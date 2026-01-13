import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { helloResponseSchema } from '../../../src/domain/hello/helloResponse';

const decodeHelloResponse = Schema.decodeUnknown(helloResponseSchema);
const arbitraryHelloResponse = Arbitrary.make(helloResponseSchema);
const invalidHelloResponse = fc.oneof(
  fc.constant({}),
  fc.record({ greeting: fc.integer() }, { requiredKeys: ['greeting'] }),
  fc.integer(),
);

const validHelloResponseProperty = fc.property(arbitraryHelloResponse, value => {
  const decoded = Effect.runSync(decodeHelloResponse(value));
  expect(decoded).toEqual(value);
});

const invalidHelloResponseProperty = fc.property(invalidHelloResponse, value => {
  expect(() => Effect.runSync(decodeHelloResponse(value))).toThrow();
});

describe('HelloResponse schema', () => {
  it.effect('decodes responses with branded greeting', () =>
    Effect.sync(() => {
      fc.assert(validHelloResponseProperty);
    }));

  it.effect('rejects missing or invalid greeting', () =>
    Effect.sync(() => {
      fc.assert(invalidHelloResponseProperty);
    }));
});
