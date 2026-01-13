// src/services/greeting.ts
import { Context, type Effect, type Option } from 'effect';
import { type Name } from '../domain/hello/name';
import { type Greeting } from '../domain/hello/greeting';

export class GreetingService extends Context.Tag('GreetingService')<
  GreetingService,
  GreetingServiceShape
>() {}

export type GreetingServiceShape = {
  readonly greet: (name: Option.Option<Name>) => Effect.Effect<Greeting>;
};
