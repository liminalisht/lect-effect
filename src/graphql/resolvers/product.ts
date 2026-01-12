// import { resolver, query } from "@gqloom/core"
// import { Schema } from "effect"
// import { runEffect } from "../effect"
// import { productWithItemsSchema, productIdInputSchema } from "../../domain/productWithItems"
// import { getProductWithItems } from "../../handlers/product"

// export const productResolvers = resolver({
//   productWithItems:
//     query(Schema.standardSchemaV1(Schema.NullOr(productWithItemsSchema)))
//       .input(Schema.standardSchemaV1(productIdInputSchema))
//       .resolve(async args =>
//         runEffect(getProductWithItems(args.id))),
// })

// // todo: add tests for resolvers
import { field, query, resolver } from "@gqloom/core"
import { Schema } from "effect"
import { runEffect } from "../effect"
import * as handlers from "../../handlers/product"
import { productIdInputSchema, productSchema } from "../../domain/product"
import { itemSchema } from "../../domain/item"
import { productWithItemsSchema } from "../../domain/productWithItems"

export const productResolvers = resolver({
  product: query(Schema.standardSchemaV1(Schema.NullOr(productSchema)))
    .input(Schema.standardSchemaV1(productIdInputSchema))
    .resolve(async (args) => runEffect(handlers.getProduct(args.id))),

  products: query(Schema.standardSchemaV1(Schema.Array(productSchema)))
    .resolve(async () => runEffect(handlers.listProducts)),

  productWithItems: query(Schema.standardSchemaV1(Schema.NullOr(productWithItemsSchema)))
    .input(Schema.standardSchemaV1(productIdInputSchema))
    .resolve(async (args) => runEffect(handlers.getProductWithItems(args.id))),
})

export const productFieldResolvers = resolver.of(
  Schema.standardSchemaV1(productSchema),
  {
    itemsForProduct: field(Schema.standardSchemaV1(Schema.Array(itemSchema)))
      .resolve(async (parent) => runEffect(handlers.itemsForProduct(parent.id))),
  }
)
