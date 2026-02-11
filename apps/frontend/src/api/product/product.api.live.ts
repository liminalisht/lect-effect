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

type CreateProductWithItemsInput = Schema.Schema.Type<typeof createProductWithItemsInputSchema>;
type ProductWithItems = Schema.Schema.Type<typeof productWithItemsSchema>;
type CreateProductWithItemsResult = {createProductWithItems: ProductWithItems};

const CreateProductWithItemsResultSchema: Schema.Schema<CreateProductWithItemsResult> = Schema.Struct({
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
        const validated: CreateProductWithItemsInput = yield * Schema.decodeUnknown(createProductWithItemsInputSchema)(input);
        const items: Array<CreateProductWithItemsInput['items'][number]> = validated.items.map(item => ({...item}));
        const response = yield * client.request(CreateProductWithItemsDocument, {
          product: validated.product,
          items,
        });
        const decoded: CreateProductWithItemsResult = yield * Schema.decodeUnknown(CreateProductWithItemsResultSchema)(response);
        return decoded.createProductWithItems;
      }),
  });
});
