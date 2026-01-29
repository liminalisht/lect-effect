/**
 * Hello handler providing a greeting based on optional name input.
 * @since 0.1.0
 */
import { Effect, Option } from 'effect';
import { nameInputSchema, type NameInput } from '@lect-effect/domain/hello/nameInput';
import { helloResponseSchema, type HelloResponse } from '@lect-effect/domain/hello/helloResponse';
import { GreetService } from '@lect-effect/services/greeting';
import { type QueryHandler } from './generic.js';
/**
 * Produces a greeting response using the greeting service.
 * @since 0.1.0
 * @category Hello Handler Effects
 */
export const helloHandler = (input: NameInput): Effect.Effect<HelloResponse, never, GreetService> =>
  Effect.gen(function * () {
    yield * Effect.logDebug('helloHandler input:', input);
    yield * Effect.logDebug('using GreetService...');
    const greetService = yield * GreetService;
    const greeting = yield * greetService.greet(Option.fromNullable(input.name ?? null));
    const response: HelloResponse = { greeting };
    yield * Effect.logDebug('helloHandler output:', response);
    return response;
  });

/**
 * Query handler for greeting users.
 * @since 0.1.0
 * @category Hello Handlers
 */
export const greetQuery: QueryHandler<
  typeof nameInputSchema,
  typeof helloResponseSchema,
  never,
  GreetService
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
 * @since 0.1.0
 * @category Hello Handlers
 */
export const helloHandlers = [
  greetQuery,
];
