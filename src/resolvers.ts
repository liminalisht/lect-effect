import { Schema } from "effect"
import { query, resolver } from "@gqloom/core"
import * as schemas from "./schemas"

const helloResolver = resolver({
  hello: query(Schema.standardSchemaV1(schemas.HelloResponseSchema))
    .input(Schema.standardSchemaV1(schemas.NameInputSchema))
    //todo: extract handler, use effect to run, providing services
    .resolve(({ name }) => `Hello, ${name ?? "World"}!`),
})

export const resolvers = [
  helloResolver,
]
