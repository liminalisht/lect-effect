import { Schema } from 'effect';
import { greetingSchema } from './greeting';

export type HelloResponse = Schema.Schema.Type<typeof helloResponseSchema>;

export const helloResponseSchema = Schema.Struct({
  greeting: greetingSchema,
}).annotations({
  title: 'HelloResponse',
  description: 'response for hello',
});
