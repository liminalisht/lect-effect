// src/services/greeting.ts
import { Context, type Effect, type Option } from 'effect';
import type { Name, Greeting } from '../domain';

export class GreetingService extends Context.Tag('GreetingService')<
  GreetingService,
  GreetingServiceShape
>() {}

type GreetingServiceShape = {
  readonly greet: (name: Option.Option<Name>) => Effect.Effect<Greeting>;
};
