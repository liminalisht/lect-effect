import { Effect, Layer, Option } from 'effect';
import { greetingSchema } from '../domain';
import { GreetingService } from '../services/greeting';

export const greetingLayer = Layer.succeed(
  GreetingService,
  GreetingService.of({
    greet: name =>
      Effect.succeed(greetingSchema.make(`Hello, ${Option.getOrElse(name, () => 'World')}!`)),
  }),
);
