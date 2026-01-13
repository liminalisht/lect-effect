import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { environmentSchema } from '../../src/config/app/environment';

const decodeEnvironment = Schema.decodeUnknown(environmentSchema);
const arbitraryEnvironment = Arbitrary.make(environmentSchema);

const validEnvironmentProperty = fc.property(arbitraryEnvironment, env => {
  const decoded = Effect.runSync(decodeEnvironment(env));
  expect(decoded).toEqual(env);
});

const invalidEnvironmentProperty = fc.property(
  fc.string().filter(value => !environmentSchema.literals.includes(value as any)),
  value => {
    expect(() => Effect.runSync(decodeEnvironment(value))).toThrow();
  },
);

describe('Environment schema', () => {
  it.effect('decodes allowed literals', () =>
    Effect.sync(() => {
      fc.assert(validEnvironmentProperty);
    }));

  it.effect('rejects values outside allowed literals', () =>
    Effect.sync(() => {
      fc.assert(invalidEnvironmentProperty);
    }));
});
