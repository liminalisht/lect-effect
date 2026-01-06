import { Schema } from "effect"
import { query, resolver } from "@gqloom/core"
import * as schemas from "./schemas"

type NameInput = Schema.Schema.Type<typeof schemas.NameInputSchema>

const helloResolver = resolver({
  hello: query(Schema.standardSchemaV1(schemas.HelloResponseSchema))
    .input(Schema.standardSchemaV1(schemas.NameInputSchema))
    //todo: extract handler, use effect to run, providing services
    .resolve((input: NameInput) => `Hello, ${input.name}!`),
})

export const resolvers = [
  helloResolver,
]
