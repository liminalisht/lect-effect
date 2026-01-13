import { Context, Effect, Schema } from 'effect';
import type * as SqlError from '@effect/sql/SqlError';
import { type ParseError } from 'effect/ParseResult';
import { type CreateItemInput } from '../domain/item/createItemInput';
import { itemIdSchema, type ItemId } from '../domain/item/itemId';
import { type Item } from '../domain/item/item';
import { type ProductId } from '../domain/product/productId';
import { decodeMany, decodeOne } from '../utilities/decode';
import { MasterdataDb } from './masterdataDb';

//todo: extract error
export type ItemRepoError = SqlError.SqlError | ParseError;

export type ItemRepoShape = {
  readonly getById: (id: ItemId) => Effect.Effect<Item | null, ItemRepoError>;
  readonly list: Effect.Effect<readonly Item[], ItemRepoError>;
  readonly create: (input: CreateItemInput) => Effect.Effect<Item, ItemRepoError>;
  readonly listForProduct: (productId: ProductId) => Effect.Effect<readonly Item[], ItemRepoError>;
  readonly linkToProduct: (itemId: ItemId, productId: ProductId) => Effect.Effect<void, ItemRepoError>;
};

export class ItemRepo extends Context.Tag('ItemRepo')<ItemRepo, ItemRepoShape>() {}

const ItemRowSchema = Schema.Struct({
  id: itemIdSchema,
  description: Schema.NullOr(Schema.String),
  pack_size: Schema.Number.pipe(Schema.int()),
});

const toDomain = (r: Schema.Schema.Type<typeof ItemRowSchema>): Item => ({
  // __typename: 'Item',
  ...r,
});

export const ItemRepoLive = Effect.gen(function * () {
  const { sql } = yield * MasterdataDb;

  const getById = (id: ItemId) =>
    Effect.logDebug('ItemRepo.getById: query', { id }).pipe(
      Effect.andThen(sql`
        SELECT id, description, pack_size
        FROM item
        WHERE id = ${id}
      `),
      Effect.flatMap(rows => (rows.length === 0 ? Effect.succeed(null) : decodeOne(ItemRowSchema)(rows[0]))),
      Effect.map(row => (row === null ? null : toDomain(row))),
      Effect.tap(row => Effect.logDebug('ItemRepo.getById: result', { id, row })),
      Effect.tapError(error => Effect.logDebug('ItemRepo.getById: error', { id, error })),
    );

  const list = Effect.logDebug('ItemRepo.list: query').pipe(
    Effect.andThen(sql`
      SELECT id, description, pack_size
      FROM item
      ORDER BY id
    `),
    Effect.flatMap(decodeMany(ItemRowSchema)),
    Effect.map(rows => rows.map(row => toDomain(row))),
    Effect.tap(rows => Effect.logDebug('ItemRepo.list: result', { count: rows.length })),
    Effect.tapError(error => Effect.logDebug('ItemRepo.list: error', { error })),
  );

  const create = (input: CreateItemInput) =>
    Effect.logDebug('ItemRepo.create: inserting', { input }).pipe(
      Effect.andThen(sql`
        INSERT INTO item (description, pack_size)
        VALUES (${input.description ?? null}, ${input.pack_size})
        RETURNING id, description, pack_size
      `),
      Effect.flatMap(rows => decodeOne(ItemRowSchema)(rows[0])),
      Effect.map(row => toDomain(row)),
      Effect.tap(row => Effect.logDebug('ItemRepo.create: result', { row })),
      Effect.tapError(error => Effect.logDebug('ItemRepo.create: error', { input, error })),
    );

  // product -> many items via item_prod
  const listForProduct = (productId: ProductId) =>
    Effect.logDebug('ItemRepo.listForProduct: query', { productId }).pipe(
      Effect.andThen(sql`
        SELECT i.id, i.description, i.pack_size
        FROM item i
        JOIN item_prod ip ON ip.item_id = i.id
        WHERE ip.product_id = ${productId}
        ORDER BY i.id
      `),
      Effect.flatMap(decodeMany(ItemRowSchema)),
      Effect.map(rows => rows.map(row => toDomain(row))),
      Effect.tap(rows => Effect.logDebug('ItemRepo.listForProduct: result', { productId, count: rows.length })),
      Effect.tapError(error => Effect.logDebug('ItemRepo.listForProduct: error', { productId, error })),
    );

  const linkToProduct = (itemId: ItemId, productId: ProductId) =>
    Effect.logDebug('ItemRepo.linkToProduct: linking', { itemId, productId }).pipe(
      Effect.andThen(sql`
        INSERT INTO item_prod (item_id, product_id)
        VALUES (${itemId}, ${productId})
      `),
      Effect.asVoid,
      Effect.tapError(error => Effect.logDebug('ItemRepo.linkToProduct: error', { itemId, productId, error })),
    );

  return {
    getById, list, create, listForProduct, linkToProduct,
  } as const;
}).pipe(Effect.map(svc => ItemRepo.of(svc)));
