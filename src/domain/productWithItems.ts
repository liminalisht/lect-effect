import { Schema } from "effect"
import { productSchema } from "./product"
import { itemSchema } from "./item"

export type ProductWithItems = Schema.Schema.Type<typeof productWithItemsSchema>;

export const productWithItemsSchema = Schema.Struct({
  product: productSchema,
  items: Schema.Array(itemSchema)
})

export type ProductIdInput = Schema.Schema.Type<typeof productIdInputSchema>;

export const productIdInputSchema = Schema.Struct({ id: Schema.Number.pipe(Schema.int()) })
