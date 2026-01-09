// src/services/greeting.ts
import { Context, Effect, Option, Schema } from 'effect';
import type { Name, Greeting } from '../domain/schemas';

export class GreetingService extends Context.Tag('GreetingService')<
  GreetingService,
  GreetingServiceShape
>() {}

type GreetingServiceShape = {
  readonly greet: (name: Option.Option<Name>) => Effect.Effect<Greeting>;
};
