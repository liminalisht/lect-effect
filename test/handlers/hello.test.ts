import { Arbitrary, Effect, Schema } from 'effect';
import { it } from '@effect/vitest';
import { describe, expect } from 'vitest';
import * as fc from 'fast-check';
import { helloHandler } from '../../src/handlers/hello';
import { greetingLayer } from '../../src/layers/greeting';
import { helloResponseSchema } from '../../src/domain/hello/helloResponse';
import { nameInputSchema } from '../../src/domain/hello/nameInput';

const decodeHelloResponse = Schema.decodeUnknown(helloResponseSchema);
const arbitraryNameInput = Arbitrary.make(nameInputSchema);

describe('helloHandler', () => {
  it.effect('greets provided name or World', () =>
    Effect.sync(() => {
      fc.assert(fc.asyncProperty(arbitraryNameInput, async input => {
        const response = await Effect.runPromise(helloHandler(input).pipe(Effect.provide(greetingLayer)));
        const decoded = Effect.runSync(decodeHelloResponse(response));
        const expectedName = input.name ?? 'World';
        expect(decoded.greeting).toContain(expectedName);
      }));
    }));
});
