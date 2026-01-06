import { query, resolver } from "@gqloom/core"
import * as handlers from "./handlers"
import * as schemas from "./schemas"
import { appRuntime } from "./env"

export const makeResolvers = (runtime = appRuntime) => {
  const helloResolver = resolver({
    hello: query(schemas.HelloResponseStandard)
      .input(schemas.NameInputStandard)
      .resolve((input) => runtime.runPromise(handlers.helloHandler(input))),
  })

  return [helloResolver]
}
