import type { Runtime } from "effect"
import type { YogaInitialContext } from "graphql-yoga"
import type { AppConfigService } from "./services"

export type GraphQLContext = YogaInitialContext & {
  readonly runtime: Runtime.Runtime<AppConfigService>
}
