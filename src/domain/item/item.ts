/**
 * Item domain schema module.
 * @since 1.0.0
 */
import { Schema } from 'effect';
import { itemIdSchema } from './itemId';
import { itemDescriptionSchema } from './itemDescription';
import { packSizeSchema } from './packSize';
/**
 * Item domain entity.
 * @since 1.0.0
 */
export type Item = Schema.Schema.Type<typeof itemSchema>;
/**
 * Item schema used across persistence and GraphQL layers.
 * @since 1.0.0
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
