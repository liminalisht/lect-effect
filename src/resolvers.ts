import { query, resolver } from "@gqloom/core"
import * as handlers from "./handlers"
import * as schemas from "./schemas"

const helloResolver = resolver({
  hello: query(schemas.HelloResponseStandard)
    .input(schemas.NameInputStandard)
    //todo: use effect to run, providing services
    .resolve(handlers.helloHandler),
})

export const resolvers = [
  helloResolver,
]
