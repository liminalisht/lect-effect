import { describe, expect, it } from '@effect/vitest';
import * as fc from 'fast-check';
import {
  Arbitrary,
  Effect,
  Layer,
  LogLevel,
  Option,
  Redacted,
} from 'effect';
import type * as SqlClient from '@effect/sql/SqlClient';
import { makeSchema, type GraphQLResolver } from '../../../src/graphql/schema';
import { handlersToResolvers } from '../../../src/graphql/resolvers';
import { helloHandlers } from '../../../src/handlers/hello';
import { itemHandlers } from '../../../src/handlers/item';
import { productHandlers } from '../../../src/handlers/product';
import { makeYoga, type Yoga } from '../../../src/graphql/yoga';
import { ConfigService } from '../../../src/services/interfaces/config';
import { GreetingService } from '../../../src/services/interfaces/greeting';
import { MasterdataDb } from '../../../src/services/interfaces/masterdataDb';
import { ProductRepo, type ProductRepoShape } from '../../../src/services/interfaces/productRepo';
import { ItemRepo, type ItemRepoShape } from '../../../src/services/interfaces/itemRepo';
import { type Product } from '../../../src/domain/product/product';
import { type Item } from '../../../src/domain/item/item';
import { createProductWithItemsInputSchema, type CreateProductWithItemsInput } from '../../../src/domain/product/createProductWithItemsInput';
import { type Port } from '../../../src/services/appConfig/interface/port';
import { type Greeting } from '../../../src/domain/hello/greeting';
import { type AppServices } from '../../../src/services/interfaces/app';

const schema = makeSchema(handlersToResolvers([
  ...helloHandlers,
  ...itemHandlers,
  ...productHandlers,
]) as readonly GraphQLResolver[]);

const arbitraryCreateProductWithItemsInput = Arbitrary.make(createProductWithItemsInputSchema);
const arbitraryCreateProductWithItemsInputNonEmpty: fc.Arbitrary<CreateProductWithItemsInput>
  = arbitraryCreateProductWithItemsInput.filter((input: CreateProductWithItemsInput) => input.items.length > 0);

const normalizeInput = (input: CreateProductWithItemsInput): CreateProductWithItemsInput => ({
  product: { description: input.product.description ?? null },
  items: input.items.map(item => ({ description: item.description ?? null, pack_size: item.pack_size })),
});

const makeAppLayer = () => {
  let nextProductId = 1;
  let nextItemId = 1;
  const products: Product[] = [];
  const items: Item[] = [];
  const links = new Map<Item['id'], Product['id']>();

  const productRepo: ProductRepoShape = {
    getById: id => Effect.succeed(Option.fromNullable(products.find(p => p.id === id))),
    getForItem: itemId => Effect.succeed(Option.fromNullable(links.get(itemId)).pipe(Option.flatMap(productId => Option.fromNullable(products.find(p => p.id === productId))))),
    list: Effect.succeed(products),
    create(input) {
      const product: Product = {
        __typename: 'Product',
        id: nextProductId as Product['id'],
        description: input.description ?? null,
      };
      nextProductId += 1;
      products.push(product);
      return Effect.succeed(product);
    },
  };

  const itemRepo: ItemRepoShape = {
    getById: id => Effect.succeed(items.find(i => i.id === id) ?? null),
    list: Effect.succeed(items),
    create(input) {
      const item: Item = {
        id: nextItemId as Item['id'],
        description: input.description ?? null,
        pack_size: input.pack_size,
      };
      nextItemId += 1;
      items.push(item);
      return Effect.succeed(item);
    },
    listForProduct: productId => Effect.succeed(items.filter(item => links.get(item.id) === productId)),
    linkToProduct(itemId, productId) {
      links.set(itemId, productId);
      return Effect.succeed(undefined);
    },
  };

  const configLayer = Layer.succeed(ConfigService, {
    app: { port: 3000 as Port, logLevel: LogLevel.Info, environment: 'test' },
    masterdataPg: {
      url: Redacted.make('postgres://test'),
      pool: { min: 0, max: 1, idleTimeoutMillis: 0 },
    },
  });

  const greetingLayer = Layer.succeed(GreetingService, {
    greet: name => Effect.succeed(Option.match(name, { onNone: () => 'World', onSome: n => n }) as Greeting),
  });

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const masterdataLayer = Layer.succeed(MasterdataDb, { sql: {} as SqlClient.SqlClient });

  const reposLayer = Layer.mergeAll(
    Layer.succeed(ProductRepo, productRepo),
    Layer.succeed(ItemRepo, itemRepo),
  );

  const appLayer = Layer.mergeAll(configLayer, greetingLayer, masterdataLayer, reposLayer);

  return { appLayer, state: { products, items, links } } as const;
};

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
          const { appLayer } = makeAppLayer();
          const yoga = await Effect.runPromise(makeYoga<AppServices>(schema).pipe(Effect.provide(appLayer)));

          const mutation = /* GraphQL */ `
            mutation CreateProductWithItems($product: CreateProductWithItemsProductInput!, $items: [CreateItemInput!]!) {
              createProductWithItems(product: $product, items: $items) {
                product { id description __typename }
                items { id description pack_size }
              }
            }
          `;

          const mutationJson = await fetchJson(yoga, mutation, { product: input.product, items: input.items });
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

          const queryJson = await fetchJson(yoga, query, { productId, itemId: firstItemId });
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
        })),
      catch: (e: unknown) => e as Error,
    }));
});
