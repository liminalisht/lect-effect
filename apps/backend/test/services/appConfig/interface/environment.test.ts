import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { environmentSchema, type Environment } from '@lect-effect/services/appConfig/interface/environment';

const decodeEnvironment: (u: unknown) => Effect.Effect<Environment, unknown, never>
  = Schema.decodeUnknown(environmentSchema);
const arbitraryEnvironment = Arbitrary.make(environmentSchema);
const allowedEnvironments = environmentSchema.literals as readonly string[];

const validEnvironmentProperty = fc.property(arbitraryEnvironment, env => {
  const decoded = Effect.runSync(decodeEnvironment(env));
  expect(decoded).toEqual(env);
});

const invalidEnvironmentProperty = fc.property(
  fc.string().filter(value => !allowedEnvironments.includes(value)),
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
