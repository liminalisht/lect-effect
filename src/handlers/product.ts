import { Effect } from "effect"
import { ProductRepo } from "../services/productRepo"
import { ItemRepo } from "../services/itemRepo"
import { type ProductId } from "../domain/product"

export const getProductWithItems = (id: ProductId) =>
  Effect.gen(function* () {
    const productRepo = yield* ProductRepo
    const itemRepo = yield* ItemRepo

    const productOpt = yield* productRepo.getById(id)
    if (productOpt._tag === "None") {
      return null
    }

    const product = productOpt.value
    const items = yield* itemRepo.listForProduct(id)

    return { product, items } as const

  })
