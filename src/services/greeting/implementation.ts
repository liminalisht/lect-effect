import { Effect, Option } from 'effect';
import { greetingSchema } from '../../domain/hello/greeting';
import { GreetService } from './interface';

export const GreetServiceImplementation = GreetService.of({
  greet: name => Effect.succeed(greetingSchema.make(`Hello, ${Option.getOrElse(name, () => 'World')}!`)),
});
