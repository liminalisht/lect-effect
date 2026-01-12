// import { Context, Effect, Option, Schema } from "effect"
// import type * as SqlError from "@effect/sql/SqlError"

// import { productSchema, type Product, type ProductId } from "../domain/product"
// import { MasterdataDb } from "./masterdataDb"
// import { decodeMany, decodeOne } from "../utilities/decode"
// import { ParseError } from "effect/ParseResult"

// // todo: this is not how we do errors... why not use TaggedError like elsewhere?
// export class ProductNotFound extends Error {
//   readonly _tag = "ProductNotFound"
//   constructor(readonly id: ProductId) {
//     super(`Product not found: ${id}`)
//   }
// }

// // todo: move / import in AppError
// export type ProductRepoError = SqlError.SqlError | ProductNotFound | ParseError

// export type ProductRepoShape = {
//   readonly getById: (id: ProductId) => Effect.Effect<Option.Option<Product>, ProductRepoError>
//   readonly list: Effect.Effect<ReadonlyArray<Product>, ProductRepoError>
// }

// export class ProductRepo extends Context.Tag("ProductRepo")<
//   ProductRepo,
//   ProductRepoShape
// >() {}

// //todo: move?
// // row schema matches DB columns (no __typename)
// const ProductRowSchema = Schema.Struct({
//   id: Schema.Number.pipe(Schema.int()),
//   description: Schema.NullOr(Schema.String)
// })

// const toDomain = (r: Schema.Schema.Type<typeof ProductRowSchema>): Product => ({
//   __typename: "Product",
//   ...r
// })

// //todo: move to layer
// export const ProductRepoLive = Effect.gen(function* () {
//   const { sql } = yield* MasterdataDb

//   const list = sql`
//     SELECT id, description
//     FROM product
//     ORDER BY id
//   `.pipe(
//     Effect.flatMap(decodeMany(ProductRowSchema)),
//     Effect.map((rows) => rows.map(toDomain))
//   )

//   const getById = (id: ProductId) =>
//     sql`
//       SELECT id, description
//       FROM product
//       WHERE id = ${id}
//     `.pipe(
//       Effect.flatMap((rows) =>
//         rows.length === 0
//           ? Effect.succeed(Option.none())
//           : decodeOne(ProductRowSchema)(rows[0]).pipe(
//               Effect.map((row) => Option.some(toDomain(row)))
//             )
//       )
//     )

//   return { list, getById } as const
// }).pipe(Effect.map((svc) => ProductRepo.of(svc)))
import { Array, Context, Effect, Option, Schema } from "effect"
import type * as SqlError from "@effect/sql/SqlError"
import { ParseError } from "effect/ParseResult"

import { MasterdataDb } from "./masterdataDb"
import { decodeMany, decodeOne } from "../utilities/decode"
import { productIdSchema, type Product, type ProductId, type ProductInput } from "../domain/product"
import type { ItemId } from "../domain/item"

// todo: this is not how we do errors... why not use TaggedError like elsewhere?
export class ProductNotFound extends Error {
  readonly _tag = "ProductNotFound"
  constructor(readonly id: ProductId) {
    super(`Product not found: ${id}`)
  }
}

// todo: move / import in AppError
export type ProductRepoError = SqlError.SqlError | ProductNotFound | ParseError

export type ProductRepoShape = {
  readonly getById: (id: ProductId) => Effect.Effect<Option.Option<Product>, ProductRepoError>
  readonly getForItem: (itemId: ItemId) => Effect.Effect<Option.Option<Product>, ProductRepoError>
  readonly list: Effect.Effect<ReadonlyArray<Product>, ProductRepoError>
  readonly create: (input: ProductInput) => Effect.Effect<Product, ProductRepoError>
}

export class ProductRepo extends Context.Tag("ProductRepo")<
  ProductRepo,
  ProductRepoShape
>() {}

// row schema matches DB columns (no __typename)
const ProductRowSchema = Schema.Struct({
  id: productIdSchema,
  description: Schema.NullOr(Schema.String)
})

const toDomain = (r: Schema.Schema.Type<typeof ProductRowSchema>): Product => ({
  __typename: "Product",
  ...r
})

export const ProductRepoLive = Effect.gen(function* () {
  const { sql } = yield* MasterdataDb

  const list = sql`
    SELECT id, description
    FROM product
    ORDER BY id
  `.pipe(
    Effect.flatMap(decodeMany(ProductRowSchema)),
    Effect.map((rows) => rows.map(toDomain))
  )

  const getById = (id: ProductId) =>
    sql`
      SELECT id, description
      FROM product
      WHERE id = ${id}
    `.pipe(
      Effect.flatMap((rows) =>
        rows.length === 0
          ? Effect.succeed(Option.none())
          : decodeOne(ProductRowSchema)(rows[0]).pipe(
              Effect.map((row) => Option.some(toDomain(row)))
            )
      )
    )

  const getForItem = (itemId: ItemId) =>
    sql`
      SELECT p.id, p.description
      FROM product p
      JOIN item_prod ip ON ip.product_id = p.id
      WHERE ip.item_id = ${itemId}
      ORDER BY p.id
      LIMIT 1
    `.pipe(
      Effect.flatMap((rows) =>
        rows.length === 0
          ? Effect.succeed(Option.none())
          : decodeOne(ProductRowSchema)(rows[0]).pipe(
              Effect.map((row) => Option.some(toDomain(row)))
            )
      )
    )

  const create = (input: ProductInput) =>
    sql`
      INSERT INTO product (description)
      VALUES (${input.description ?? null})
      RETURNING id, description
    `.pipe(
      Effect.flatMap((rows) => decodeOne(ProductRowSchema)(rows[0])),
      Effect.map(toDomain)
    )

  return { list, getById, getForItem, create } as const
}).pipe(Effect.map((svc) => ProductRepo.of(svc)))
