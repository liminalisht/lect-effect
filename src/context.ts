import type { Runtime } from "effect"
import type { YogaInitialContext } from "graphql-yoga"
import type { AppEnv } from "./env"

export type GraphQLContext = YogaInitialContext & {
  readonly runtime: Runtime.Runtime<AppEnv>
}
