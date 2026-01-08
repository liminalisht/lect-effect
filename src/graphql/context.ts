import type { Runtime } from "effect"
import type { YogaInitialContext } from "graphql-yoga"
import type { ConfigService } from "../services"

//todo: this is specialized to ConfigService, make generic utility? or make specific versions for different services?
export type GraphQLContext = YogaInitialContext & {
  readonly runtime: Runtime.Runtime<ConfigService>
}
