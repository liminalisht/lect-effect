/**
 * Hello domain response envelope definitions.
 * @since 0.1.0
 */
import { Schema } from 'effect';
import { greetingSchema } from './greeting.js';

/**
 * Response structure returned by the hello operation.
 * @since 0.1.0
 * @category Domain Types
 */
export type HelloResponse = Schema.Schema.Type<typeof helloResponseSchema>;

/**
 * Schema for the hello response envelope.
 * @since 0.1.0
 * @category Domain Schemas
 */
export const helloResponseSchema = Schema.Struct({
  greeting: greetingSchema,
}).annotations({
  title: 'HelloResponse',
  description: 'response to hello query',
});
