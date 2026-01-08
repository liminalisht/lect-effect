import { Effect } from 'effect';
import type * as schemas from './schemas';

export const helloHandler = (input: schemas.NameInput): Effect.Effect<schemas.HelloResponse> =>
  Effect.gen(function * () {
    yield * Effect.logDebug(`helloHandler input:`, input);

    const who = input.name ?? 'World';
    const greeting = `Hello, ${who}!`;
    const response: schemas.HelloResponse = { greeting };

    yield * Effect.logDebug(`helloHandler output:`, response);
    return response;
  });
