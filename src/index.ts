import "dotenv/config"
import { Effect } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import { AppConfig, AppLayer} from "./env"
import { listen, logSchema } from "./server"

const program = Effect.scoped(
  Effect.gen(function* () {
    const { port } = yield* AppConfig
    const runtime  = yield* Effect.runtime<AppConfig>()

    yield* logSchema

    yield* listen(runtime, port)

    const url = `http://localhost:${port}/graphql`
    yield* Effect.logInfo(`Server is running on ${url}`)

    return yield* Effect.never
  })
)

NodeRuntime.runMain(
  program.pipe(Effect.provide(AppLayer)),
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

