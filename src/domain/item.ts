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
export const itemIdSchema = Schema.Number.pipe(Schema.int());

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
});

// GraphQL arg-shape: { description?, pack_size }
/**
 * GraphQL input for creating or updating an item.
 * @since 1.0.0
 */
export type ItemInput = Schema.Schema.Type<typeof itemInputSchema>;
/**
 * Input schema for creating or updating an item.
 * @since 1.0.0
 */
export const itemInputSchema = Schema.Struct({
  description: Schema.optional(Schema.NullOr(Schema.String)),
  pack_size: Schema.Number.pipe(Schema.int()),
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
  __typename: Schema.optional(Schema.Literal('Item')),
  id: itemIdSchema,
  description: Schema.NullOr(Schema.String),
  pack_size: Schema.Number.pipe(Schema.int()),
});
