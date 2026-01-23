/**
 * Item domain schema module.
 * @since 1.0.0
 */
import { Schema } from 'effect';
import { itemIdSchema } from './itemId.js';
import { itemDescriptionSchema } from './itemDescription.js';
import { packSizeSchema } from './packSize.js';
/**
 * Item domain entity.
 * @since 1.0.0
 * @category Domain Types
 */
export type Item = Schema.Schema.Type<typeof itemSchema>;
/**
 * Item schema used across persistence and GraphQL layers.
 * @since 1.0.0
 * @category Domain Schemas
 */
export const itemSchema = Schema.Struct({
  // __typename: Schema.optional(Schema.Literal('Item')),
  id: itemIdSchema,
  description: itemDescriptionSchema,
  pack_size: packSizeSchema,
}).annotations({
  title: 'Item',
  description: 'item',
});
