import {
  Context, Effect, Layer, Option, Schema,
} from 'effect';
import { GreetingService, greetingSchema } from '../services/greeting';

export const greetingLayer = Layer.succeed(
  GreetingService,
  GreetingService.of({
    greet: name =>
      Effect.succeed(greetingSchema.make(`Hello, ${Option.getOrElse(name, () => 'World')}!`)),
  }),
);
