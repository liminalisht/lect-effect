// import { Schema } from "effect"

// // todo: brand
// export type ProductId = Schema.Schema.Type<typeof productIdSchema>
// export const productIdSchema = Schema.Number.pipe(Schema.int())

// export type Product = Schema.Schema.Type<typeof productSchema>
// // todo: description annotations
// export const productSchema = Schema.Struct({
//   __typename: Schema.optional(Schema.Literal("Product")),
//   id: productIdSchema,
//   description: Schema.NullOr(Schema.String)
// })

// // todo: add tests for domain schemas
import { Schema } from "effect"

// todo: brand
export type ProductId = Schema.Schema.Type<typeof productIdSchema>
export const productIdSchema = Schema.Number.pipe(Schema.int())

// GraphQL arg-shape: { id }
export type ProductIdInput = Schema.Schema.Type<typeof productIdInputSchema>
export const productIdInputSchema = Schema.Struct({
  id: productIdSchema
})

// GraphQL arg-shape: { description? }
export type ProductInput = Schema.Schema.Type<typeof productInputSchema>
export const productInputSchema = Schema.Struct({
  // nullable + optional, matching old `z.string().nullable().optional()`
  description: Schema.optional(Schema.NullOr(Schema.String))
})

export type Product = Schema.Schema.Type<typeof productSchema>
// todo: description annotations
export const productSchema = Schema.Struct({
  __typename: Schema.optional(Schema.Literal("Product")),
  id: productIdSchema,
  description: Schema.NullOr(Schema.String)
})

// todo: add tests for domain schemas
