import { Context, Effect } from 'effect';
import type { ParseError } from 'effect/ParseResult';
import type { GraphQLClientError } from '../../app/core/graphql/graphql-errors';
import type { CreateProductWithItemsInput } from '@lect-effect/domain/product/createProductWithItemsInput';
import type { ProductWithItems } from '@lect-effect/domain/product/productWithItems';

export type ProductApiError = GraphQLClientError | ParseError;

export type ProductApi = {
  readonly createProductWithItems: (
    input: unknown,
  ) => Effect.Effect<ProductWithItems, ProductApiError>;
};

export class ProductApiService extends Context.Tag('ProductApiService')<
  ProductApiService,
  ProductApi
>() {}
