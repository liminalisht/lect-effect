/**
 * Hello handler providing a greeting based on optional name input.
 * @since 1.0.0
 */
import { Effect, Option } from 'effect';
import { nameInputSchema, type NameInput } from '../domain/hello/nameInput';
import { helloResponseSchema, type HelloResponse } from '../domain/hello/helloResponse';
import { GreetingService } from '../services/interfaces/greeting';
import { type QueryHandler } from './generic';
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

/**
 * Query handler for greeting users.
 * @since 1.0.0
 */
export const greetQuery: QueryHandler<
  typeof nameInputSchema,
  typeof helloResponseSchema,
  never,
  GreetingService
> = {
  kind: 'query',
  key: 'greet',
  descriptionString: 'greet a user by name',
  inputSchema: nameInputSchema,
  outputSchema: helloResponseSchema,
  handler: helloHandler,
};

/**
 * Registered hello handlers for GraphQL resolver conversion.
 * @since 1.0.0
 */
export const helloHandlers = [
  greetQuery,
];
