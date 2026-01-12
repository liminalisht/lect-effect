import { Layer } from "effect"
import { ProductRepo, ProductRepoLive } from "../services/productRepo"

export const productRepoLayer = Layer.effect(ProductRepo, ProductRepoLive)
