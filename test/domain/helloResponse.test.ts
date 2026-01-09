import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { helloResponseSchema } from '../../src/domain/helloResponse';

const decodeHelloResponse = Schema.decodeUnknown(helloResponseSchema);
const arbitraryHelloResponse = Arbitrary.make(helloResponseSchema);

describe('HelloResponse schema', () => {
  it.effect('decodes responses with branded greeting', () =>
    Effect.sync(() => {
      fc.assert(fc.property(arbitraryHelloResponse, value => {
        const decoded = Effect.runSync(decodeHelloResponse(value));
        expect(decoded).toEqual(value);
      }));
    }));

  it.effect('rejects missing or invalid greeting', () =>
    Effect.sync(() => {
      const invalid = fc.oneof(
        fc.constant({}),
        fc.record({ greeting: fc.integer() }, { requiredKeys: ['greeting'] }),
        fc.integer(),
      );

      fc.assert(fc.property(invalid, value => {
        expect(() => Effect.runSync(decodeHelloResponse(value))).toThrow();
      }));
    }));
});
