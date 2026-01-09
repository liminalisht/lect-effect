import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { greetingSchema } from '../../src/domain/greeting';

const decodeGreeting = Schema.decodeUnknown(greetingSchema);
const arbitraryGreeting = Arbitrary.make(greetingSchema);

describe('Greeting schema', () => {
  it.effect('decodes branded strings', () =>
    Effect.sync(() => {
      fc.assert(fc.property(arbitraryGreeting, greeting => {
        const decoded = Effect.runSync(decodeGreeting(greeting));
        expect(decoded).toEqual(greeting);
      }));
    }));

  it.effect('rejects non-strings', () =>
    Effect.sync(() => {
      const invalid = fc.anything().filter(value => typeof value !== 'string');

      fc.assert(fc.property(invalid, value => {
        expect(() => Effect.runSync(decodeGreeting(value))).toThrow();
      }));
    }));
});
