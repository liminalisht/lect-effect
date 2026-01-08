import "dotenv/config"
import { Effect } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import { AppLayer } from "./layers/app"
import { ConfigService } from "./services"
import { listen, logSchema } from "./graphql/server"

// todo: grok Effect.scoped and Effect.gen interaction better
const program = Effect.scoped(
  Effect.gen(function* () {
    const config = yield* ConfigService
    const runtime  = yield* Effect.runtime<ConfigService>()

    yield* Effect.logDebug(`logging graphql schema:`)
    yield* logSchema

    yield* listen(runtime, config.port)

    const url = `http://localhost:${config.port}/graphql`
    yield* Effect.logInfo(`Server is running on ${url}`)

    return yield* Effect.never
  })
)

const programWithAppLayer = program.pipe(Effect.provide(AppLayer))

NodeRuntime.runMain(
  programWithAppLayer,
  {
    teardown: function customTeardown(exit, onExit) {
      if (exit._tag === "Failure") {
        console.error("Program ended with an error.", exit.cause)
        onExit(1)
      } else {
        onExit(0)
      }
    },
  }
)

