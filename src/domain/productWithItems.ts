// import { Schema } from "effect"
// import { productSchema } from "./product"
// import { itemSchema } from "./item"

// export type ProductWithItems = Schema.Schema.Type<typeof productWithItemsSchema>;

// export const productWithItemsSchema = Schema.Struct({
//   product: productSchema,
//   items: Schema.Array(itemSchema)
// })

// export type ProductIdInput = Schema.Schema.Type<typeof productIdInputSchema>;

// export const productIdInputSchema = Schema.Struct({ id: Schema.Number.pipe(Schema.int()) })
import { Schema } from "effect"
import { itemInputSchema, itemSchema } from "./item"
import { productIdInputSchema, productInputSchema, productSchema } from "./product"

// mutation arg-shape: { product, items }
export type CreateProductWithItemsInput =
  Schema.Schema.Type<typeof createProductWithItemsInputSchema>

export const createProductWithItemsInputSchema = Schema.Struct({
  product: productInputSchema,
  items: Schema.Array(itemInputSchema)
})

export type ProductWithItems = Schema.Schema.Type<typeof productWithItemsSchema>
export const productWithItemsSchema = Schema.Struct({
  product: productSchema,
  items: Schema.Array(itemSchema)
})

// keep the existing import location viable
export { productIdInputSchema }
