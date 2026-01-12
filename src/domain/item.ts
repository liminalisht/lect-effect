// import { Schema } from "effect"

// //todo: brand
// export type ItemId = Schema.Schema.Type<typeof itemIdSchema>
// export const itemIdSchema = Schema.Number.pipe(Schema.int())

// // todo: description annotations

// export type Item = Schema.Schema.Type<typeof itemSchema>
// export const itemSchema = Schema.Struct({
//   __typename: Schema.optional(Schema.Literal("Item")),
//   id: itemIdSchema,
//   description: Schema.NullOr(Schema.String),
//   pack_size: Schema.Number.pipe(Schema.int())
// })
import { Schema } from "effect"

//todo: brand
export type ItemId = Schema.Schema.Type<typeof itemIdSchema>
export const itemIdSchema = Schema.Number.pipe(Schema.int())

// GraphQL arg-shape: { id }
export type ItemIdInput = Schema.Schema.Type<typeof itemIdInputSchema>
export const itemIdInputSchema = Schema.Struct({
  id: itemIdSchema
})

// GraphQL arg-shape: { description?, pack_size }
export type ItemInput = Schema.Schema.Type<typeof itemInputSchema>
export const itemInputSchema = Schema.Struct({
  description: Schema.optional(Schema.NullOr(Schema.String)),
  pack_size: Schema.Number.pipe(Schema.int())
})

export type Item = Schema.Schema.Type<typeof itemSchema>
export const itemSchema = Schema.Struct({
  __typename: Schema.optional(Schema.Literal("Item")),
  id: itemIdSchema,
  description: Schema.NullOr(Schema.String),
  pack_size: Schema.Number.pipe(Schema.int())
})
