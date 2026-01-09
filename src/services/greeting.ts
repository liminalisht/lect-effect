// src/services/greeting.ts
import {
  Context, Effect, Layer, Option, Schema,
} from 'effect';
import type { Name } from '../domain/schemas';

// todo: move to domain?
export type Greeting = Schema.Schema.Type<typeof greetingSchema>;
export const greetingSchema = Schema.String.pipe(Schema.brand('Greeting'));

export class GreetingService extends Context.Tag('GreetingService')<
  GreetingService,
  GreetingServiceShape
>() {}

type GreetingServiceShape = {
  readonly greet: (name: Option.Option<Name>) => Effect.Effect<Greeting>;
};

// todo: move to layers?
export const greetingLayer = Layer.succeed(
  GreetingService,
  GreetingService.of({
    greet: name =>
      Effect.succeed(greetingSchema.make(`Hello, ${Option.getOrElse(name, () => 'World')}!`)),
  }),
);
