import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { greetingSchema } from '@lect-effect/domain/hello/greeting';

const decodeGreeting = Schema.decodeUnknown(greetingSchema);
const arbitraryGreeting = Arbitrary.make(greetingSchema);
const invalidGreeting = fc.anything().filter(value => typeof value !== 'string');

const validGreetingProperty = fc.property(arbitraryGreeting, greeting => {
  const decoded = Effect.runSync(decodeGreeting(greeting));
  expect(decoded).toEqual(greeting);
});

const invalidGreetingProperty = fc.property(invalidGreeting, value => {
  expect(() => Effect.runSync(decodeGreeting(value))).toThrow();
});

describe('Greeting schema', () => {
  it.effect('decodes branded strings', () =>
    Effect.sync(() => {
      fc.assert(validGreetingProperty);
    }));

  it.effect('rejects non-strings', () =>
    Effect.sync(() => {
      fc.assert(invalidGreetingProperty);
    }));
});
