import { Effect, Runtime } from "effect"
import { useContext } from "@gqloom/core/context"
import type { AppConfig } from "./services"
import type { GraphQLContext } from "./context"

export const runEffect = <A, E>(
  eff: Effect.Effect<A, E, AppConfig>,
  ctx?: Partial<GraphQLContext> | null
): Promise<A> => {
  const context = ctx ?? useContext<GraphQLContext>()
  const runtime = context?.runtime

  if (!runtime) {
    return Promise.reject(new Error("Runtime missing from GraphQL context"))
  }

  return Runtime.runPromise(runtime, eff)
}
