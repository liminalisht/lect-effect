/**
 * @fileoverview Product APIs (create product with items) using Effect + shared schemas.
 * @since 1.0.0
 */
import {Effect, Schema} from 'effect';
import {type ParseError} from 'effect/ParseResult';
import {createProductWithItemsInputSchema, type CreateProductWithItemsInput} from '@lect-effect/domain/product/createProductWithItemsInput';
import {productWithItemsSchema, type ProductWithItems} from '@lect-effect/domain/product/productWithItems';
import {GraphQLClientTag, type GraphQLClient} from '../app/core/graphql/graphql-client.js';
import type {GraphQLClientError} from '../app/core/graphql/graphql-errors.js';

/**
 * Errors possible from the createProductWithItems API call.
 * @since 1.0.0
 */
export type CreateProductWithItemsApiError = GraphQLClientError | ParseError;

// Must match backend schema/tests exactly.
const CreateProductWithItemsMutation = /* GraphQL */ `
  mutation CreateProductWithItems($product: CreateProductWithItemsProductInput!, $items: [CreateItemInput!]!) {
    createProductWithItems(product: $product, items: $items) {
      product { id description __typename }
      items { id description pack_size }
    }
  }
`;

// GraphQLClient.request returns the `data` payload, so decode `{ createProductWithItems: ... }`.
const CreateProductWithItemsDataSchema = Schema.Struct({
  createProductWithItems: productWithItemsSchema,
});

const normalizeInput = (input: CreateProductWithItemsInput): CreateProductWithItemsInput => ({
  product: {
    description: input.product.description ?? null,
  },
  items: input.items.map(item => ({
    description: item.description ?? null,
    pack_size: item.pack_size,
  })),
});

/**
 * Calls the createProductWithItems GraphQL mutation and returns the decoded result.
 * @since 1.0.0
 */
export const createProductWithItems = (rawInput: unknown): Effect.Effect<ProductWithItems, CreateProductWithItemsApiError, GraphQLClient> =>
  Effect.gen(function * () {
    const input = yield * Schema.decodeUnknown(createProductWithItemsInputSchema)(rawInput);
    const variables = normalizeInput(input);

    const client = yield * GraphQLClientTag;
    const dataJson = yield * client.request(CreateProductWithItemsMutation, variables);

    const decoded = yield * Schema.decodeUnknown(CreateProductWithItemsDataSchema)(dataJson);
    return decoded.createProductWithItems;
  });
