import { describe, expect, it } from '@effect/vitest';
import * as fc from 'fast-check';
import {
  Arbitrary,
  Effect,
} from 'effect';
import { makeSchema, type GraphQLResolver } from '../../../src/graphql/schema.js';
import { handlersToResolvers } from '../../../src/graphql/resolvers.js';
import { helloHandlers } from '../../../src/handlers/hello.js';
import { itemHandlers } from '../../../src/handlers/item.js';
import { productHandlers } from '../../../src/handlers/product.js';
import { makeYoga, type Yoga } from '../../../src/graphql/yoga.js';
import { MasterdataDbService } from '../../../src/services/masterdataDb/interface.js';
import { createProductWithItemsInputSchema, type CreateProductWithItemsInput } from '@lect-effect/domain/product/createProductWithItemsInput';
import { type AppServices } from '../../../src/services/app/interface.js';
import { withTestAppLayer } from '../../testRuntime.js';

// todo: extract - maybe even explicitly in app.ts for reuse?
const schema = makeSchema(handlersToResolvers([
  ...helloHandlers,
  ...itemHandlers,
  ...productHandlers,
]) as readonly GraphQLResolver[]);

const arbitraryCreateProductWithItemsInput: fc.Arbitrary<CreateProductWithItemsInput>
  = Arbitrary.make(createProductWithItemsInputSchema);
const arbitraryCreateProductWithItemsInputNonEmpty: fc.Arbitrary<CreateProductWithItemsInput>
  = arbitraryCreateProductWithItemsInput.filter((input: CreateProductWithItemsInput) => input.items.length > 0);

const normalizeInput = (input: CreateProductWithItemsInput): CreateProductWithItemsInput => ({
  product: { description: input.product.description ?? null },
  items: input.items.map(item => ({ description: item.description ?? null, pack_size: item.pack_size })),
});

const fetchJson = async (yoga: Yoga<AppServices>, query: string, variables?: Record<string, unknown>) => {
  const res = await yoga.fetch('http://unused/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  return json as {data?: any; errors?: unknown};
};

describe('GraphQL product & item boundary (property)', () => {
  it.effect('createProductWithItems mutation is reflected across queries and fields', () =>
    Effect.tryPromise({
      try: () =>
        fc.assert(fc.asyncProperty(arbitraryCreateProductWithItemsInputNonEmpty, async (rawInput: CreateProductWithItemsInput) => {
          const input = normalizeInput(rawInput);

          return Effect.runPromise(withTestAppLayer(Effect.gen(function * () {
            const { sql } = yield * MasterdataDbService;
            // ensure deterministic DB state for each property case
            yield * sql`TRUNCATE item_prod, item, product RESTART IDENTITY;`;

            const yoga = yield * makeYoga<AppServices>(schema);

            const mutation = /* GraphQL */ `
                    mutation CreateProductWithItems($product: CreateProductWithItemsProductInput!, $items: [CreateItemInput!]!) {
                      createProductWithItems(product: $product, items: $items) {
                        product { id description __typename }
                        items { id description pack_size }
                      }
                    }
                  `;

            const mutationJson = yield * Effect.promise(async () => fetchJson(yoga, mutation, { product: input.product, items: input.items }));
            expect(mutationJson.errors).toBeUndefined();
            const created = mutationJson.data.createProductWithItems;
            const productId = created.product.id;
            const firstItemId = created.items[0]?.id;

            const query = /* GraphQL */ `
                    query ProductSuite($productId: Int!, $itemId: Int!) {
                      getProduct(id: $productId) {
                        id
                        description
                        items { id description pack_size }
                      }
                      getProductWithItems(id: $productId) {
                        product { id description }
                        items { id description pack_size }
                      }
                      listProducts { id description }
                      listItems {
                        id
                        description
                        pack_size
                        product { id description }
                      }
                      getItem(id: $itemId) {
                        id
                        description
                        product { id description }
                      }
                    }
                  `;

            const queryJson = yield * Effect.promise(async () => fetchJson(yoga, query, { productId, itemId: firstItemId }));
            expect(queryJson.errors).toBeUndefined();

            const { getProduct, getProductWithItems, listProducts, listItems } = queryJson.data;

            expect(created.product).toEqual({ id: productId, description: input.product.description ?? null, __typename: 'Product' });
            expect(created.items).toEqual(getProduct.items);

            expect(getProductWithItems).toEqual({
              product: { id: productId, description: input.product.description ?? null },
              items: getProduct.items,
            });

            expect(listProducts).toEqual([{ id: productId, description: input.product.description ?? null }]);
            expect(listItems).toEqual(input.items.map((item, idx) => ({
              id: created.items[idx].id,
              description: item.description ?? null,
              pack_size: item.pack_size,
              product: { id: productId, description: input.product.description ?? null },
            })));
          })));
        })),
      catch: (e: unknown) => e as Error,
    }));
});
