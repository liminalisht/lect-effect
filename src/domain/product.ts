/**
 * Product domain schema and related input shapes.
 * @since 1.0.0
 */

// // todo: add tests for domain schemas
import { Schema } from 'effect';

// todo: brand
/**
 * Product identifier.
 * @since 1.0.0
 */
export type ProductId = Schema.Schema.Type<typeof productIdSchema>;
/**
 * Schema for product identifiers.
 * @since 1.0.0
 */
export const productIdSchema = Schema.Number.pipe(Schema.int()).annotations({ description: 'product identifier' });

// GraphQL arg-shape: { id }
/**
 * GraphQL input for selecting a product by id.
 * @since 1.0.0
 */
export type ProductIdInput = Schema.Schema.Type<typeof productIdInputSchema>;
/**
 * Input schema for selecting a product by id.
 * @since 1.0.0
 */
export const productIdInputSchema = Schema.Struct({
  id: productIdSchema,
});

export type ProductDescription = Schema.Schema.Type<typeof productDescriptionSchema>;
export const productDescriptionSchema = Schema.String.annotations({ description: 'product description' });

// GraphQL arg-shape: { description? }
/**
 * GraphQL input for creating or updating a product.
 * @since 1.0.0
 */
export type ProductInput = Schema.Schema.Type<typeof productInputSchema>;
/**
 * Input schema for creating or updating a product.
 * @since 1.0.0
 */
export const productInputSchema = Schema.Struct({
  // nullable + optional, matching old `z.string().nullable().optional()`
  description: Schema.optional(Schema.NullOr(productDescriptionSchema)).annotations({ description: 'product description (nullable & optional)' }),
});

/**
 * Product domain entity.
 * @since 1.0.0
 */
export type Product = Schema.Schema.Type<typeof productSchema>;
// todo: description annotations
/**
 * Product schema used across persistence and GraphQL layers.
 * @since 1.0.0
 */
export const productSchema = Schema.Struct({
  __typename: Schema.optional(Schema.Literal('Product')),
  id: productIdSchema,
  description: Schema.NullOr(productDescriptionSchema).annotations({ description: 'product description (nullable)' }),
}).annotations({
  title: 'Product',
  description: 'product',
});

// todo: add tests for domain schemas
