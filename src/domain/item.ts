import { Schema } from "effect"

//todo: brand
export type ItemId = Schema.Schema.Type<typeof itemIdSchema>
export const itemIdSchema = Schema.Number.pipe(Schema.int())

// todo: description annotations

export type Item = Schema.Schema.Type<typeof itemSchema>
export const itemSchema = Schema.Struct({
  __typename: Schema.optional(Schema.Literal("Item")),
  id: itemIdSchema,
  description: Schema.NullOr(Schema.String),
  pack_size: Schema.Number.pipe(Schema.int())
})
