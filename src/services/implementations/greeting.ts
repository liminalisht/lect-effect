import { Effect, Option } from 'effect';
import { greetingSchema } from '../../domain/hello/greeting';
import { GreetingService } from '../interfaces/greeting';

export const greetingServiceImplementation = GreetingService.of({
  greet: name => Effect.succeed(greetingSchema.make(`Hello, ${Option.getOrElse(name, () => 'World')}!`)),
});
