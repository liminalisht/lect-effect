/**
 * Item description value object definitions.
 * @since 1.0.0
 */
import { Schema } from 'effect';

/**
 * Item description value.
 * @since 1.0.0
 */
export type ItemDescription = Schema.Schema.Type<typeof itemDescriptionSchema>;

/**
 * Schema for nullable item descriptions.
 * @since 1.0.0
 */
export const itemDescriptionSchema = Schema.NullOr(Schema.String).annotations({
  description: 'item description (nullable)',
});

