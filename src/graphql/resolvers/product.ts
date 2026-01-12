import { resolver, query } from "@gqloom/core"
import { Schema } from "effect"
import { runEffect } from "../effect"
import { productWithItemsSchema, productIdInputSchema } from "../../domain/productWithItems"
import { getProductWithItems } from "../../handlers/product"

export const productResolvers = resolver({
  productWithItems:
    query(Schema.standardSchemaV1(Schema.NullOr(productWithItemsSchema)))
      .input(Schema.standardSchemaV1(productIdInputSchema))
      .resolve(async args =>
        runEffect(getProductWithItems(args.id))),
})

// todo: add tests for resolvers
