/**
 * Greeting service layer wiring.
 * @since 1.0.0
 */
import { Effect, Layer, Option } from 'effect';
import { greetingSchema } from '../../domain/hello/greeting';
import { GreetService } from './interface';

/**
 * Concrete greeting service implementation.
 * @since 1.0.0
 */
export const GreetServiceImplementation = GreetService.of({
  greet: name => Effect.succeed(greetingSchema.make(`Hello, ${Option.getOrElse(name, () => 'World')}!`)),
});
/**
 * Provides the GreetService implementation.
 * @since 1.0.0
 */
export const greetingLayer: Layer.Layer<GreetService> = Layer.succeed(
  GreetService,
  GreetServiceImplementation,
);
