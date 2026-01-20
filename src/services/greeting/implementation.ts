/**
 * Greeting service implementation helpers.
 * @since 1.0.0
 */
import { Effect, Option } from 'effect';
import { greetingSchema } from '../../domain/hello/greeting.js';
import { GreetService } from './interface.js';

/**
 * Concrete GreetService implementation.
 * @since 1.0.0
 */
export const greetServiceImplementation = GreetService.of({
  greet: name => Effect.succeed(greetingSchema.make(`Hello, ${Option.getOrElse(name, () => 'World')}!`)),
});
