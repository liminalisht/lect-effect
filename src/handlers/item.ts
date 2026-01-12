import { Effect, Option } from "effect"
import { ItemRepo } from "../services/itemRepo"
import { ProductRepo } from "../services/productRepo"
import type { ItemId, ItemInput } from "../domain/item"

export const getItem = (id: ItemId) =>
  Effect.gen(function* () {
    const repo = yield* ItemRepo
    return yield* repo.getById(id)
  })

export const listItems = Effect.gen(function* () {
  const repo = yield* ItemRepo
  return yield* repo.list
})

export const createItem = (input: ItemInput) =>
  Effect.gen(function* () {
    const repo = yield* ItemRepo
    return yield* repo.create(input)
  })

export const productForItem = (itemId: ItemId) =>
  Effect.gen(function* () {
    const repo = yield* ProductRepo
    const opt = yield* repo.getForItem(itemId)
    return Option.getOrNull(opt)
  })
