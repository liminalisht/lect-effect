import { Schema } from "effect"

// todo: brand
export type ProductId = Schema.Schema.Type<typeof productIdSchema>
export const productIdSchema = Schema.Number.pipe(Schema.int())

export type Product = Schema.Schema.Type<typeof productSchema>
// todo: description annotations
export const productSchema = Schema.Struct({
  __typename: Schema.optional(Schema.Literal("Product")),
  id: productIdSchema,
  description: Schema.NullOr(Schema.String)
})
