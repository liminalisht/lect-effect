/**
 * Product domain schema and related input shapes.
 * @since 1.0.0
 */
// import { Schema } from "effect"

// // todo: brand
// export type ProductId = Schema.Schema.Type<typeof productIdSchema>
// export const productIdSchema = Schema.Number.pipe(Schema.int())

// export type Product = Schema.Schema.Type<typeof productSchema>
// // todo: description annotations
// export const productSchema = Schema.Struct({
//   __typename: Schema.optional(Schema.Literal("Product")),
//   id: productIdSchema,
//   description: Schema.NullOr(Schema.String)
// })

// // todo: add tests for domain schemas
import { Schema } from "effect"

// todo: brand
/**
 * Product identifier.
 * @since 1.0.0
 */
export type ProductId = Schema.Schema.Type<typeof productIdSchema>
/**
 * Schema for product identifiers.
 * @since 1.0.0
 */
export const productIdSchema = Schema.Number.pipe(Schema.int())

// GraphQL arg-shape: { id }
/**
 * GraphQL input for selecting a product by id.
 * @since 1.0.0
 */
export type ProductIdInput = Schema.Schema.Type<typeof productIdInputSchema>
/**
 * Input schema for selecting a product by id.
 * @since 1.0.0
 */
export const productIdInputSchema = Schema.Struct({
  id: productIdSchema
})

// GraphQL arg-shape: { description? }
/**
 * GraphQL input for creating or updating a product.
 * @since 1.0.0
 */
export type ProductInput = Schema.Schema.Type<typeof productInputSchema>
/**
 * Input schema for creating or updating a product.
 * @since 1.0.0
 */
export const productInputSchema = Schema.Struct({
  // nullable + optional, matching old `z.string().nullable().optional()`
  description: Schema.optional(Schema.NullOr(Schema.String))
})

/**
 * Product domain entity.
 * @since 1.0.0
 */
export type Product = Schema.Schema.Type<typeof productSchema>
// todo: description annotations
/**
 * Product schema used across persistence and GraphQL layers.
 * @since 1.0.0
 */
export const productSchema = Schema.Struct({
  __typename: Schema.optional(Schema.Literal("Product")),
  id: productIdSchema,
  description: Schema.NullOr(Schema.String)
})

// todo: add tests for domain schemas
