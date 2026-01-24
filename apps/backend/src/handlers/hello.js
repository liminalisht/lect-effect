/**
 * Hello handler providing a greeting based on optional name input.
 * @since 1.0.0
 */
import {Effect, Option} from 'effect';
import {nameInputSchema} from '@lect-effect/domain/hello/nameInput';
import {helloResponseSchema} from '@lect-effect/domain/hello/helloResponse';
import {GreetService} from '../services/greeting/interface.js';
/**
 * Produces a greeting response using the greeting service.
 * @since 1.0.0
 * @category Hello Handler Effects
 */
export const helloHandler = input => Effect.gen(function * () {
	yield * Effect.logDebug('helloHandler input:', input);
	yield * Effect.logDebug('using GreetService...');
	const greetService = yield * GreetService;
	const greeting = yield * greetService.greet(Option.fromNullable(input.name ?? null));
	const response = {greeting};
	yield * Effect.logDebug('helloHandler output:', response);
	return response;
});
/**
 * Query handler for greeting users.
 * @since 1.0.0
 * @category Hello Handlers
 */
export const greetQuery = {
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
 * @category Hello Handlers
 */
export const helloHandlers = [
	greetQuery,
];
