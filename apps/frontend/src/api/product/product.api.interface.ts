/**
 * Product API interface definitions and service tag.
 * @since 1.0.0
 */
import { Context, type Effect } from 'effect';
import type { ParseError } from 'effect/ParseResult';
import type { ProductWithItems } from '@lect-effect/domain/product/productWithItems';
import type { GraphQLClientError } from '../../app/core/graphql/graphql-errors';

/**
 * Error union produced by product API operations.
 * @since 1.0.0
 * @category Service Errors
 */
export type ProductApiError = GraphQLClientError | ParseError;

/**
 * Public surface of the product API service.
 * @since 1.0.0
 * @category Service Interfaces
 */
export type ProductApi = {
  readonly createProductWithItems: (
    input: unknown,
  ) => Effect.Effect<ProductWithItems, ProductApiError>;
};

/**
 * Tag for locating the product API service in an Effect environment.
 * @since 1.0.0
 * @category Services
 */
export class ProductApiService extends Context.Tag('ProductApiService')<
  ProductApiService,
  ProductApi
>() {}
