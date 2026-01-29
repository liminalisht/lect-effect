/**
 * Greeting service layer wiring.
 * @since 0.1.0
 */
import { Effect, Layer, Option } from 'effect';
import { greetingSchema } from '@lect-effect/domain/hello/greeting';
import { GreetService } from '@lect-effect/services/greeting';

/**
 * Concrete greeting service implementation.
 * @since 0.1.0
 * @category Service Implementations
 */
export const GreetServiceImplementation = GreetService.of({
  greet: name => Effect.succeed(greetingSchema.make(`Hello, ${Option.getOrElse(name, () => 'World')}!`)),
});
/**
 * Provides the GreetService implementation.
 * @since 0.1.0
 * @category Layers
 */
export const greetingLayer: Layer.Layer<GreetService> = Layer.succeed(
  GreetService,
  GreetServiceImplementation,
);
