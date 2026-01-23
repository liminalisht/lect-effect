import { Effect, Schema } from 'effect';
import { GraphQLClientService } from '../../app/core/graphql/graphql-client';
import { ProductApiService } from './product.api.interface.js';
import { type CreateProductWithItemsInput, createProductWithItemsInputSchema } from '@lect-effect/domain/product/createProductWithItemsInput';
import { type ProductWithItems, productWithItemsSchema } from '@lect-effect/domain/product/productWithItems';

const createProductMutation = `
  mutation CreateProductWithItems($product: CreateProductWithItemsProductInput!, $items: [CreateItemInput!]!) {
    createProductWithItems(product: $product, items: $items) {
      product {
        id
        description
        __typename
      }
      items {
        id
        description
        pack_size
      }
    }
  }
`;

const CreateProductWithItemsResultSchema = Schema.Struct({
  createProductWithItems: productWithItemsSchema,
});

export const productApiLive = Effect.gen(function* () {
  const client = yield* GraphQLClientService;

  return ProductApiService.of({
    createProductWithItems: (input: unknown) =>
      Effect.gen(function* () {
        const validated = yield* Schema.decodeUnknown(createProductWithItemsInputSchema)(input);

        // normalize (keep your current semantics)
        const normalized = {
          ...validated,
          product: {
            ...validated.product,
            description: validated.product.description ?? null, // todo: is this necessary?
          },
          items: validated.items.map(item => ({
            ...item,
            pack_size: item.pack_size ?? null, // todo: is this necessary?
          })),
        };

        const response = yield* client.request(createProductMutation, {
          product: normalized.product,
          items: normalized.items,
        });
        const decoded = yield* Schema.decodeUnknown(CreateProductWithItemsResultSchema)(response);
        return decoded.createProductWithItems;
      }),
  });
});
