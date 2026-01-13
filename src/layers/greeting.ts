/**
 * Greeting service layer wiring.
 * @since 1.0.0
 */
import { Effect, Layer, Option } from 'effect';
import { greetingSchema } from '../domain/hello/greeting';
import { GreetingService } from '../services/greeting';

/**
 * Provides the GreetingService implementation.
 * @since 1.0.0
 */
export const greetingLayer: Layer.Layer<GreetingService> = Layer.succeed(
  GreetingService,
  GreetingService.of({
    greet: name =>
      Effect.succeed(greetingSchema.make(`Hello, ${Option.getOrElse(name, () => 'World')}!`)),
  }),
);
