import { query, resolver } from "@gqloom/core"
import * as handlers from "../domain/handlers"
import * as schemas from "../domain/schemas"
import { runEffect } from "../runEffect"

export const makeResolvers = () => {
  const helloResolver = resolver({
    hello: query(schemas.HelloResponseStandard)
      .input(schemas.NameInputStandard)
      .resolve((args, payload) =>
        runEffect(
          handlers.helloHandler(args),
          (payload as { readonly context?: unknown } | undefined)?.context as
            | import("./context").GraphQLContext
            | undefined
        )
      ),
  })

  return [helloResolver]
}
