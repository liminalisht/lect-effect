/**
 * Hello domain response envelope definitions.
 * @since 1.0.0
 */
import { Schema } from 'effect';
import { greetingSchema } from './greeting.js';

/**
 * Response structure returned by the hello operation.
 * @since 1.0.0
 */
export type HelloResponse = Schema.Schema.Type<typeof helloResponseSchema>;

/**
 * Schema for the hello response envelope.
 * @since 1.0.0
 */
export const helloResponseSchema = Schema.Struct({
  greeting: greetingSchema,
}).annotations({
  title: 'HelloResponse',
  description: 'response to hello query',
});
