/**
 * Live implementation of the product API backed by GraphQL.
 * @since 0.1.0
 */
import { Effect, Schema } from 'effect';
import { createProductWithItemsInputSchema } from '@lect-effect/domain/product/createProductWithItemsInput';
import { productWithItemsSchema } from '@lect-effect/domain/product/productWithItems';
import { GraphQLClientService } from '../../app/core/graphql/graphql-client.js';
import { CreateProductWithItemsDocument } from '../../graphql/generated/graphql.js';
import { ProductApiService } from './product.api.interface.js';

const CreateProductWithItemsResultSchema = Schema.Struct({
  createProductWithItems: productWithItemsSchema,
});

/**
 * Layer constructor yielding the live product API service.
 * @since 0.1.0
 * @category Service Implementations
 */
export const productApiLive = Effect.gen(function * () {
  const client = yield * GraphQLClientService;

  return ProductApiService.of({
    createProductWithItems: (input: unknown) =>
      Effect.gen(function * () {
        const validated = yield * Schema.decodeUnknown(createProductWithItemsInputSchema)(input);

        // normalize (keep your current semantics)
        const normalized = {
          ...validated,
          product: {
            ...validated.product,
            description: validated.product.description ?? null, // todo: is this necessary?
          },
          items: validated.items.map(item => ({
            ...item,
            description: item.description ?? null,
            pack_size: item.pack_size,
          })),
        };

        const response = yield * client.request(CreateProductWithItemsDocument, {
          product: normalized.product,
          items: normalized.items,
        });
        const decoded = yield * Schema.decodeUnknown(CreateProductWithItemsResultSchema)(response);
        return decoded.createProductWithItems;
      }),
  });
});
