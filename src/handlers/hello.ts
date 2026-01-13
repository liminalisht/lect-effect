/**
 * Hello handler providing a greeting based on optional name input.
 * @since 1.0.0
 */
import { Effect, Option } from 'effect';
import { type NameInput } from '../domain/hello/nameInput';
import { type HelloResponse } from '../domain/hello/helloResponse';
import { GreetingService } from '../services/greeting';

/**
 * Produces a greeting response using the greeting service.
 * @since 1.0.0
 */
export const helloHandler = (input: NameInput): Effect.Effect<HelloResponse, never, GreetingService> =>
  Effect.gen(function * () {
    yield * Effect.logDebug('helloHandler input:', input);
    yield * Effect.logDebug('using GreetingService...');
    const greetingService = yield * GreetingService;
    const greeting = yield * greetingService.greet(Option.fromNullable(input.name ?? null));
    const response: HelloResponse = { greeting };
    yield * Effect.logDebug('helloHandler output:', response);
    return response;
  });
