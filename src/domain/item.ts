/**
 * Item domain schema and related input shapes.
 * @since 1.0.0
 */
import { Schema } from 'effect';

// todo: brand
/**
 * Item identifier.
 * @since 1.0.0
 */
export type ItemId = Schema.Schema.Type<typeof itemIdSchema>;
/**
 * Identifier schema for items.
 * @since 1.0.0
 */
export const itemIdSchema = Schema.Number.pipe(Schema.int()).annotations({ description: 'item identifier' });

// GraphQL arg-shape: { id }
/**
 * GraphQL input for selecting an item by id.
 * @since 1.0.0
 */
export type ItemIdInput = Schema.Schema.Type<typeof itemIdInputSchema>;
/**
 * Input schema for selecting an item by id.
 * @since 1.0.0
 */
export const itemIdInputSchema = Schema.Struct({
  id: itemIdSchema,
}).annotations({
  title: 'ItemIdInput',
  description: 'input containing an item identifier',
});


export type ItemDescription = Schema.Schema.Type<typeof itemDescriptionSchema>;

export const itemDescriptionSchema = Schema.NullOr(Schema.String).annotations({
  description: 'item description (nullable)',
});

export type PackSize = Schema.Schema.Type<typeof packSizeSchema>;

export const packSizeSchema = Schema.Number.pipe(Schema.int()).annotations({
  description: 'item pack size',
});


// GraphQL arg-shape: { description?, pack_size }
/**
 * GraphQL input for creating or updating an item.
 * @since 1.0.0
 */
export type CreateItemInput = Schema.Schema.Type<typeof createItemInputSchema>;
/**
 * Input schema for creating or updating an item.
 * @since 1.0.0
 */
export const createItemInputSchema = Schema.Struct({
  description: Schema.optional(itemDescriptionSchema).annotations({ description: 'item description (nullable & optional)' }),
  pack_size: packSizeSchema,
}).annotations({
  title: 'CreateItemInput',
  description: 'input for creating an item',
});

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
