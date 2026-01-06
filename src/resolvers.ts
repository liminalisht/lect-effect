import { Schema } from "effect"
import { query, resolver } from "@gqloom/core"
import * as handlers from "./handlers"
import * as schemas from "./schemas"

const helloResolver = resolver({
  hello: query(Schema.standardSchemaV1(schemas.HelloResponseSchema))
    .input(Schema.standardSchemaV1(schemas.NameInputSchema))
    //todo: use effect to run, providing services
    .resolve(handlers.helloHandler),
})

export const resolvers = [
  helloResolver,
]
