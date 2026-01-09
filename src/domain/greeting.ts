import { Schema } from 'effect';

export type Greeting = Schema.Schema.Type<typeof greetingSchema>;

export const greetingSchema = Schema.String.pipe(Schema.brand('Greeting')).annotations({
  description: 'greeting message',
});
