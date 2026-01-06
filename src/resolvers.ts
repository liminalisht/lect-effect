import { query, resolver } from "@gqloom/core"
import { Effect } from "effect"
import * as handlers from "./handlers"
import * as schemas from "./schemas"

const helloResolver = resolver({
  hello: query(schemas.HelloResponseStandard)
    .input(schemas.NameInputStandard)
    //todo: use effect to run, providing services
    .resolve((input) => Effect.runPromise(handlers.helloHandler(input))),
})

export const resolvers = [
  helloResolver,
]
