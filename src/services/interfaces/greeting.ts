/**
 * Greeting service contract.
 * @since 1.0.0
 */
import { Context, type Effect, type Option } from 'effect';
import { type Name } from '../../domain/hello/name';
import { type Greeting } from '../../domain/hello/greeting';

/**
 * Service tag for greeting operations.
 * @since 1.0.0
 */
export class GreetingService extends Context.Tag('GreetingService')<
  GreetingService,
  GreetingServiceShape
>() {}

/**
 * Interface for the greeting service implementation.
 * @since 1.0.0
 */
export type GreetingServiceShape = {
  readonly greet: (name: Option.Option<Name>) => Effect.Effect<Greeting>;
};
