/**
 * Item handlers bridging GraphQL operations to item and product repositories.
 * @since 1.0.0
 */
import { Effect, Schema } from 'effect';
import type { ItemId } from '@lect-effect/domain/item/itemId';
import { itemSchema } from '@lect-effect/domain/item/item';
import { createItemInputSchema, type CreateItemInput } from '@lect-effect/domain/item/createItemInput';
import { itemIdInputSchema } from '@lect-effect/domain/item/itemIdInput';
import { ProductRepoService, type ProductRepoError } from '../services/productRepo/interface.js';
import { ItemRepoService, type ItemRepoError } from '../services/itemRepo/interface.js';
import { type QueryHandler, type FieldHandler, type MutationHandler } from './generic.js';
/**
 * Fetches an item by id.
 * @since 1.0.0
 * @category Item Handler Effects
 */
export declare const getItem: (id: ItemId) => Effect.Effect<{
    readonly description: string | null;
    readonly id: number;
    readonly pack_size: number;
} | null, ItemRepoError, ItemRepoService>;
declare const nullableItemSchema: Schema.NullOr<Schema.Struct<{
    id: Schema.refine<number, typeof Schema.Number>;
    description: Schema.NullOr<typeof Schema.String>;
    pack_size: Schema.refine<number, typeof Schema.Number>;
}>>;
declare const emptyStructSchema: Schema.Struct<{}>;
declare const itemArraySchema: Schema.Array$<Schema.Struct<{
    id: Schema.refine<number, typeof Schema.Number>;
    description: Schema.NullOr<typeof Schema.String>;
    pack_size: Schema.refine<number, typeof Schema.Number>;
}>>;
declare const nullableProductSchema: Schema.NullOr<Schema.Struct<{
    __typename: Schema.optional<Schema.Literal<["Product"]>>;
    id: Schema.refine<number, typeof Schema.Number>;
    description: Schema.NullOr<Schema.SchemaClass<string, string, never>>;
}>>;
/**
 * Query handler for fetching a single item.
 * @since 1.0.0
 * @category Item Handlers
 */
export declare const getItemQuery: QueryHandler<typeof itemIdInputSchema, typeof nullableItemSchema, ItemRepoError, ItemRepoService>;
/**
 * Lists all items.
 * @since 1.0.0
 * @category Item Handler Effects
 */
export declare const listItems: Effect.Effect<readonly {
    readonly description: string | null;
    readonly id: number;
    readonly pack_size: number;
}[], ItemRepoError, ItemRepoService>;
/**
 * Query handler for listing all items.
 * @since 1.0.0
 * @category Item Handlers
 */
export declare const listItemsQuery: QueryHandler<typeof emptyStructSchema, typeof itemArraySchema, ItemRepoError, ItemRepoService>;
/**
 * Creates a new item.
 * @since 1.0.0
 * @category Item Handler Effects
 */
export declare const createItem: (input: CreateItemInput) => Effect.Effect<{
    readonly description: string | null;
    readonly id: number;
    readonly pack_size: number;
}, ItemRepoError, ItemRepoService>;
/**
 * Mutation handler for creating a new item.
 * @since 1.0.0
 * @category Item Handlers
 */
export declare const createItemMutation: MutationHandler<typeof createItemInputSchema, typeof itemSchema, ItemRepoError, ItemRepoService>;
/**
 * Looks up the product for a given item id, returning null when absent.
 * @since 1.0.0
 * @category Item Handler Effects
 */
export declare const productForItem: (itemId: ItemId) => Effect.Effect<{
    readonly description: string | null;
    readonly __typename?: "Product" | undefined;
    readonly id: number;
} | null, ProductRepoError, ProductRepoService>;
/**
 * Field resolver for loading the product related to an item.
 * @since 1.0.0
 * @category Item Handlers
 */
export declare const productForItemField: FieldHandler<typeof itemSchema, typeof emptyStructSchema, typeof nullableProductSchema, ProductRepoError, ProductRepoService>;
/**
 * Registered item handlers for GraphQL resolver conversion.
 * @since 1.0.0
 * @category Item Handlers
 */
export declare const itemHandlers: (QueryHandler<Schema.Struct<{
    id: Schema.refine<number, typeof Schema.Number>;
}>, Schema.NullOr<Schema.Struct<{
    id: Schema.refine<number, typeof Schema.Number>;
    description: Schema.NullOr<typeof Schema.String>;
    pack_size: Schema.refine<number, typeof Schema.Number>;
}>>, ItemRepoError, ItemRepoService> | QueryHandler<Schema.Struct<{}>, Schema.Array$<Schema.Struct<{
    id: Schema.refine<number, typeof Schema.Number>;
    description: Schema.NullOr<typeof Schema.String>;
    pack_size: Schema.refine<number, typeof Schema.Number>;
}>>, ItemRepoError, ItemRepoService> | MutationHandler<Schema.Struct<{
    description: Schema.optional<Schema.NullOr<typeof Schema.String>>;
    pack_size: Schema.refine<number, typeof Schema.Number>;
}>, Schema.Struct<{
    id: Schema.refine<number, typeof Schema.Number>;
    description: Schema.NullOr<typeof Schema.String>;
    pack_size: Schema.refine<number, typeof Schema.Number>;
}>, ItemRepoError, ItemRepoService> | FieldHandler<Schema.Struct<{
    id: Schema.refine<number, typeof Schema.Number>;
    description: Schema.NullOr<typeof Schema.String>;
    pack_size: Schema.refine<number, typeof Schema.Number>;
}>, Schema.Struct<{}>, Schema.NullOr<Schema.Struct<{
    __typename: Schema.optional<Schema.Literal<["Product"]>>;
    id: Schema.refine<number, typeof Schema.Number>;
    description: Schema.NullOr<Schema.SchemaClass<string, string, never>>;
}>>, ProductRepoError, ProductRepoService>)[];
export {};
//# sourceMappingURL=item.d.ts.map