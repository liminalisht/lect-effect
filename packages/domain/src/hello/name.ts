/**
 * Hello domain name value object definitions.
 * @since 1.0.0
 */
import { Schema } from 'effect';

/**
 * Person name value object.
 * @since 1.0.0
 * @category Domain Types
 */
export type Name = Schema.Schema.Type<typeof nameSchema>;

/**
 * Schema for validated names.
 * @since 1.0.0
 * @category Domain Schemas
 */
export const nameSchema = Schema.String.annotations({
  description: 'a name',
});
