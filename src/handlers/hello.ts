import { Effect, Option } from 'effect';
import { GreetingService } from '../services/greeting';
import type * as schemas from '../domain/schemas';

export const helloHandler = (input: schemas.NameInput): Effect.Effect<schemas.HelloResponse, never, GreetingService> =>
  Effect.gen(function * () {
    yield * Effect.logDebug('helloHandler input:', input);
    yield * Effect.logDebug('using GreetingService...');
    const greetingService = yield * GreetingService;
    const greeting = yield * greetingService.greet(Option.fromNullable(input.name ?? null));
    const response: schemas.HelloResponse = { greeting };
    yield * Effect.logDebug('helloHandler output:', response);
    return response;
  });
