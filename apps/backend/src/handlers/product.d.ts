/**
 * Product handlers bridging GraphQL operations to repositories.
 * @since 1.0.0
 */
import { Effect, Schema } from 'effect';
import type { ProductId } from '@lect-effect/domain/product/productId';
import { productIdInputSchema } from '@lect-effect/domain/product/productIdInput';
import { productSchema } from '@lect-effect/domain/product/product';
import { productWithItemsSchema } from '@lect-effect/domain/product/productWithItems';
import { productInputSchema, type ProductInput } from '@lect-effect/domain/product/productInput';
import { createProductWithItemsInputSchema, type CreateProductWithItemsInput } from '@lect-effect/domain/product/createProductWithItemsInput';
import { ItemRepoService, type ItemRepoError } from '../services/itemRepo/interface.js';
import { ProductRepoService, type ProductRepoError } from '../services/productRepo/interface.js';
import { type QueryHandler, type MutationHandler, type FieldHandler } from './generic.js';
/**
 * Fetches a single product by id or returns null.
 * @since 1.0.0
 * @category Product Handler Effects
 */
export declare const getProduct: (id: ProductId) => Effect.Effect<{
    readonly description: string | null;
    readonly __typename?: "Product" | undefined;
    readonly id: number;
} | null, ProductRepoError, ProductRepoService>;
declare const nullableProductSchema: Schema.NullOr<Schema.Struct<{
    __typename: Schema.optional<Schema.Literal<["Product"]>>;
    id: Schema.refine<number, typeof Schema.Number>;
    description: Schema.NullOr<Schema.SchemaClass<string, string, never>>;
}>>;
declare const emptyStructSchema: Schema.Struct<{}>;
declare const productsArraySchema: Schema.Array$<Schema.Struct<{
    __typename: Schema.optional<Schema.Literal<["Product"]>>;
    id: Schema.refine<number, typeof Schema.Number>;
    description: Schema.NullOr<Schema.SchemaClass<string, string, never>>;
}>>;
declare const itemsArraySchema: Schema.Array$<Schema.Struct<{
    id: Schema.refine<number, typeof Schema.Number>;
    description: Schema.NullOr<typeof Schema.String>;
    pack_size: Schema.refine<number, typeof Schema.Number>;
}>>;
declare const nullableProductWithItemsSchema: Schema.NullOr<Schema.Struct<{
    product: Schema.Struct<{
        __typename: Schema.optional<Schema.Literal<["Product"]>>;
        id: Schema.refine<number, typeof Schema.Number>;
        description: Schema.NullOr<Schema.SchemaClass<string, string, never>>;
    }>;
    items: Schema.Array$<Schema.Struct<{
        id: Schema.refine<number, typeof Schema.Number>;
        description: Schema.NullOr<typeof Schema.String>;
        pack_size: Schema.refine<number, typeof Schema.Number>;
    }>>;
}>>;
/**
 * Query handler for fetching a single product.
 * @since 1.0.0
 * @category Product Handlers
 */
export declare const getProductQuery: QueryHandler<typeof productIdInputSchema, typeof nullableProductSchema, ProductRepoError, ProductRepoService>;
/**
 * Lists all products.
 * @since 1.0.0
 * @category Product Handler Effects
 */
export declare const listProducts: Effect.Effect<readonly {
    readonly description: string | null;
    readonly __typename?: "Product" | undefined;
    readonly id: number;
}[], ProductRepoError, ProductRepoService>;
/**
 * Query handler for listing products.
 * @since 1.0.0
 * @category Product Handlers
 */
export declare const listProductsQuery: QueryHandler<typeof emptyStructSchema, typeof productsArraySchema, ProductRepoError, ProductRepoService>;
/**
 * Creates a new product.
 * @since 1.0.0
 * @category Product Handler Effects
 */
export declare const createProduct: (input: ProductInput) => Effect.Effect<{
    readonly description: string | null;
    readonly __typename?: "Product" | undefined;
    readonly id: number;
}, ProductRepoError, ProductRepoService>;
/**
 * Mutation handler for creating a product.
 * @since 1.0.0
 * @category Product Handlers
 */
export declare const createProductMutation: MutationHandler<typeof productInputSchema, typeof productSchema, ProductRepoError, ProductRepoService>;
/**
 * Lists items for a given product id.
 * @since 1.0.0
 * @category Product Handler Effects
 */
export declare const itemsForProduct: (productId: ProductId) => Effect.Effect<readonly {
    readonly description: string | null;
    readonly id: number;
    readonly pack_size: number;
}[], ItemRepoError, ItemRepoService>;
/**
 * Field resolver for loading items for the parent product.
 * @since 1.0.0
 * @category Product Handlers
 */
export declare const itemsForProductField: FieldHandler<typeof productSchema, typeof emptyStructSchema, typeof itemsArraySchema, ItemRepoError, ItemRepoService>;
/**
 * Fetches a product with its items, or null when missing.
 * @since 1.0.0
 * @category Product Handler Effects
 */
export declare const getProductWithItems: (id: ProductId) => Effect.Effect<{
    product: {
        readonly description: string | null;
        readonly __typename?: "Product" | undefined;
        readonly id: number;
    };
    items: readonly {
        readonly description: string | null;
        readonly id: number;
        readonly pack_size: number;
    }[];
} | null, import("../services/productRepo/interface.js").ProductNotFound | import("@effect/sql/SqlError").SqlError | import("effect/ParseResult").ParseError, ProductRepoService | ItemRepoService>;
/**
 * Query handler for fetching a product along with its items.
 * @since 1.0.0
 * @category Product Handlers
 */
export declare const getProductWithItemsQuery: QueryHandler<typeof productIdInputSchema, typeof nullableProductWithItemsSchema, ProductRepoError | ItemRepoError, ProductRepoService | ItemRepoService>;
/**
 * Creates a product and associated items, linking them.
 * @since 1.0.0
 * @category Product Handler Effects
 */
export declare const createProductWithItems: (input: CreateProductWithItemsInput) => Effect.Effect<{
    product: {
        readonly description: string | null;
        readonly __typename?: "Product" | undefined;
        readonly id: number;
    };
    items: {
        readonly description: string | null;
        readonly id: number;
        readonly pack_size: number;
    }[];
}, import("../services/productRepo/interface.js").ProductNotFound | import("@effect/sql/SqlError").SqlError | import("effect/ParseResult").ParseError, ProductRepoService | ItemRepoService>;
/**
 * Mutation handler for creating a product and linking its items.
 * @since 1.0.0
 * @category Product Handlers
 */
export declare const createProductWithItemsMutation: MutationHandler<typeof createProductWithItemsInputSchema, typeof productWithItemsSchema, ProductRepoError | ItemRepoError, ProductRepoService | ItemRepoService>;
/**
 * Registered product handlers for GraphQL resolver conversion.
 * @since 1.0.0
 * @category Product Handlers
 */
export declare const productHandlers: (QueryHandler<Schema.Struct<{
    id: Schema.refine<number, typeof Schema.Number>;
}>, Schema.NullOr<Schema.Struct<{
    __typename: Schema.optional<Schema.Literal<["Product"]>>;
    id: Schema.refine<number, typeof Schema.Number>;
    description: Schema.NullOr<Schema.SchemaClass<string, string, never>>;
}>>, ProductRepoError, ProductRepoService> | QueryHandler<Schema.Struct<{}>, Schema.Array$<Schema.Struct<{
    __typename: Schema.optional<Schema.Literal<["Product"]>>;
    id: Schema.refine<number, typeof Schema.Number>;
    description: Schema.NullOr<Schema.SchemaClass<string, string, never>>;
}>>, ProductRepoError, ProductRepoService> | MutationHandler<Schema.Struct<{
    description: Schema.optional<Schema.NullOr<Schema.SchemaClass<string, string, never>>>;
}>, Schema.Struct<{
    __typename: Schema.optional<Schema.Literal<["Product"]>>;
    id: Schema.refine<number, typeof Schema.Number>;
    description: Schema.NullOr<Schema.SchemaClass<string, string, never>>;
}>, ProductRepoError, ProductRepoService> | FieldHandler<Schema.Struct<{
    __typename: Schema.optional<Schema.Literal<["Product"]>>;
    id: Schema.refine<number, typeof Schema.Number>;
    description: Schema.NullOr<Schema.SchemaClass<string, string, never>>;
}>, Schema.Struct<{}>, Schema.Array$<Schema.Struct<{
    id: Schema.refine<number, typeof Schema.Number>;
    description: Schema.NullOr<typeof Schema.String>;
    pack_size: Schema.refine<number, typeof Schema.Number>;
}>>, ItemRepoError, ItemRepoService> | QueryHandler<Schema.Struct<{
    id: Schema.refine<number, typeof Schema.Number>;
}>, Schema.NullOr<Schema.Struct<{
    product: Schema.Struct<{
        __typename: Schema.optional<Schema.Literal<["Product"]>>;
        id: Schema.refine<number, typeof Schema.Number>;
        description: Schema.NullOr<Schema.SchemaClass<string, string, never>>;
    }>;
    items: Schema.Array$<Schema.Struct<{
        id: Schema.refine<number, typeof Schema.Number>;
        description: Schema.NullOr<typeof Schema.String>;
        pack_size: Schema.refine<number, typeof Schema.Number>;
    }>>;
}>>, import("../services/productRepo/interface.js").ProductNotFound | import("@effect/sql/SqlError").SqlError | import("effect/ParseResult").ParseError, ProductRepoService | ItemRepoService> | MutationHandler<Schema.Struct<{
    product: Schema.Struct<{
        description: Schema.optional<Schema.NullOr<Schema.SchemaClass<string, string, never>>>;
    }>;
    items: Schema.Array$<Schema.Struct<{
        description: Schema.optional<Schema.NullOr<typeof Schema.String>>;
        pack_size: Schema.refine<number, typeof Schema.Number>;
    }>>;
}>, Schema.Struct<{
    product: Schema.Struct<{
        __typename: Schema.optional<Schema.Literal<["Product"]>>;
        id: Schema.refine<number, typeof Schema.Number>;
        description: Schema.NullOr<Schema.SchemaClass<string, string, never>>;
    }>;
    items: Schema.Array$<Schema.Struct<{
        id: Schema.refine<number, typeof Schema.Number>;
        description: Schema.NullOr<typeof Schema.String>;
        pack_size: Schema.refine<number, typeof Schema.Number>;
    }>>;
}>, import("../services/productRepo/interface.js").ProductNotFound | import("@effect/sql/SqlError").SqlError | import("effect/ParseResult").ParseError, ProductRepoService | ItemRepoService>)[];
export {};
//# sourceMappingURL=product.d.ts.map