/**
 * Hello domain greeting message definitions.
 * @since 1.0.0
 */
import { Schema } from 'effect';

/**
 * Greeting message value object.
 * @since 1.0.0
 */
export type Greeting = Schema.Schema.Type<typeof greetingSchema>;

/**
 * Schema for greeting messages.
 * @since 1.0.0
 */
export const greetingSchema = Schema.String.pipe(Schema.brand('Greeting')).annotations({ description: 'greeting message' });
