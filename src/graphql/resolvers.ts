import { query, resolver } from "@gqloom/core"
import * as handlers from "../domain/handlers"
import * as schemas from "../domain/schemas"
import { runEffect } from "../runEffect"

export const makeResolvers = () => {
  const helloResolver = resolver({
    hello: query(schemas.HelloResponseStandard)
      .input(schemas.NameInputStandard)
      .resolve((args, payload) =>
        // todo: this is fairly gross...
        // importing here?
        // all the ? marks
        // all the unknonwns and undefineds
        // all the type assertions...
        // blegh!!!
        // this can't be our pattern going forward...
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
