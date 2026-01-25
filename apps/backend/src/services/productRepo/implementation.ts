/**
 * Product repository service implementation.
 * @since 1.0.0
 */
import { Effect, Option, Schema } from 'effect';
import { type Product } from '@lect-effect/domain/product/product';
import { type ProductId, productIdSchema } from '@lect-effect/domain/product/productId';
import { type ProductInput } from '@lect-effect/domain/product/productInput';
import type { ItemId } from '@lect-effect/domain/item/itemId';
import { decodeMany, decodeOne } from '../../utilities/decode.js';
import { MasterdataDbService } from '@lect-effect/services/masterdataDb';
import { ProductRepoService } from '@lect-effect/services/productRepo';

// row schema matches DB columns (no __typename)
const ProductRowSchema = Schema.Struct({
  id: productIdSchema,
  description: Schema.NullOr(Schema.String),
});

const toDomain = (r: Schema.Schema.Type<typeof ProductRowSchema>): Product => ({
  __typename: 'Product',
  ...r,
});

/**
 * Live implementation of the ProductRepo.
 * @since 1.0.0
 * @category Service Implementations
 */
export const productRepoImplementation = Effect.gen(function * () {
  const { sql } = yield * MasterdataDbService;

  const list = Effect.logDebug('ProductRepo.list: query').pipe(
    Effect.andThen(sql`
      SELECT id, description
      FROM product
      ORDER BY id
    `),
    Effect.flatMap(decodeMany(ProductRowSchema)),
    Effect.map(rows => rows.map(row => toDomain(row))),
    Effect.tap(rows => Effect.logDebug('ProductRepo.list: result', { count: rows.length })),
    Effect.tapError(error => Effect.logDebug('ProductRepo.list: error', { error })),
  );

  const getById = (id: ProductId) =>
    Effect.logDebug('ProductRepo.getById: query', { id }).pipe(
      Effect.andThen(sql`
        SELECT id, description
        FROM product
        WHERE id = ${id}
      `),
      Effect.flatMap(rows =>
        rows.length === 0
          ? Effect.succeed(Option.none())
          : decodeOne(ProductRowSchema)(rows[0]).pipe(Effect.map(row => Option.some(toDomain(row))))),
      Effect.tap(row => Effect.logDebug('ProductRepo.getById: result', { id, row })),
      Effect.tapError(error => Effect.logDebug('ProductRepo.getById: error', { id, error })),
    );

  const getForItem = (itemId: ItemId) =>
    Effect.logDebug('ProductRepo.getForItem: query', { itemId }).pipe(
      Effect.andThen(sql`
        SELECT p.id, p.description
        FROM product p
        JOIN item_prod ip ON ip.product_id = p.id
        WHERE ip.item_id = ${itemId}
        ORDER BY p.id
        LIMIT 1
      `),
      Effect.flatMap(rows =>
        rows.length === 0
          ? Effect.succeed(Option.none())
          : decodeOne(ProductRowSchema)(rows[0]).pipe(Effect.map(row => Option.some(toDomain(row))))),
      Effect.tap(row => Effect.logDebug('ProductRepo.getForItem: result', { itemId, row })),
      Effect.tapError(error => Effect.logDebug('ProductRepo.getForItem: error', { itemId, error })),
    );

  const create = (input: ProductInput) =>
    Effect.logDebug('ProductRepo.create: inserting', { input }).pipe(
      Effect.andThen(sql`
        INSERT INTO product (description)
        VALUES (${input.description ?? null})
        RETURNING id, description
      `),
      Effect.flatMap(rows => decodeOne(ProductRowSchema)(rows[0])),
      Effect.map(row => toDomain(row)),
      Effect.tap(row => Effect.logDebug('ProductRepo.create: result', { row })),
      Effect.tapError(error => Effect.logDebug('ProductRepo.create: error', { input, error })),
    );

  return {
    list, getById, getForItem, create,
  } as const;
}).pipe(Effect.map(svc => ProductRepoService.of(svc)));
