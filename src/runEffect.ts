import { Effect, Runtime } from "effect"
import { useContext } from "@gqloom/core/context"
import type { ConfigService } from "./services"
import type { GraphQLContext } from "./graphql/context"

//todo: this is specialized to ConfigService, make generic utility? or make specific versions for different services?
export const runEffect = <A, E>(
  eff: Effect.Effect<A, E, ConfigService>,
  ctx?: Partial<GraphQLContext> | null
): Promise<A> => {
  const context = ctx ?? useContext<GraphQLContext>()
  const runtime = context?.runtime

  if (!runtime) {
    return Promise.reject(new Error("Runtime missing from GraphQL context"))
  }

  return Runtime.runPromise(runtime, eff)
}
