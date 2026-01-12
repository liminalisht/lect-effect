import { Context, Effect, Schema } from "effect"
import type * as SqlError from "@effect/sql/SqlError"

import { itemSchema, type Item, type ItemId } from "../domain/item"
import { type ProductId } from "../domain/product"
import { MasterdataDb } from "./masterdataDb"
import { decodeMany, decodeOne } from "../utilities/decode"
import { ParseError } from "effect/ParseResult"

export type ItemRepoError = SqlError.SqlError | ParseError

export type ItemRepoShape = {
  readonly getById: (id: ItemId) => Effect.Effect<Item | null, ItemRepoError>
  readonly listForProduct: (productId: ProductId) => Effect.Effect<ReadonlyArray<Item>, ItemRepoError>
}

export class ItemRepo extends Context.Tag("ItemRepo")<ItemRepo, ItemRepoShape>() {}

const ItemRowSchema = Schema.Struct({
  id: Schema.Number.pipe(Schema.int()),
  description: Schema.NullOr(Schema.String),
  pack_size: Schema.Number.pipe(Schema.int())
})

const toDomain = (r: Schema.Schema.Type<typeof ItemRowSchema>): Item => ({
  __typename: "Item",
  ...r
})

export const ItemRepoLive = Effect.gen(function* () {
  const { sql } = yield* MasterdataDb

  const getById = (id: ItemId) =>
    sql`
      SELECT id, description, pack_size
      FROM item
      WHERE id = ${id}
    `.pipe(
      Effect.flatMap((rows) => (rows.length === 0 ? Effect.succeed(null) : decodeOne(ItemRowSchema)(rows[0]))),
      Effect.map((row) => (row === null ? null : toDomain(row)))
    )

  // product -> many items via item_prod
  const listForProduct = (productId: ProductId) =>
    sql`
      SELECT i.id, i.description, i.pack_size
      FROM item i
      JOIN item_prod ip ON ip.item_id = i.id
      WHERE ip.product_id = ${productId}
      ORDER BY i.id
    `.pipe(
      Effect.flatMap(decodeMany(ItemRowSchema)),
      Effect.map((rows) => rows.map(toDomain))
    )

  return { getById, listForProduct } as const
}).pipe(Effect.map((svc) => ItemRepo.of(svc)))
