import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import { describe, expect } from 'vitest';
import * as fc from 'fast-check';
import { helloResponseSchema } from '@lect-effect/domain/hello/helloResponse';
import { nameInputSchema } from '@lect-effect/domain/hello/nameInput';
import { helloHandler } from '@lect-effect/handlers/hello';
import { greetingLayer } from '../../src/services/greeting/layer.js';

const decodeHelloResponse = Schema.decodeUnknown(helloResponseSchema);
const arbitraryNameInput = Arbitrary.make(nameInputSchema);

describe('helloHandler', () => {
  it.effect('greets provided name or World', () =>
    Effect.promise(async () => fc.assert(fc.asyncProperty(arbitraryNameInput, async input => {
      const response = await Effect.runPromise(helloHandler(input).pipe(Effect.provide(greetingLayer)));
      const decoded = Effect.runSync(decodeHelloResponse(response));
      const expectedName = input.name ?? 'World';
      expect(decoded.greeting).toContain(expectedName);
    }))));
});
