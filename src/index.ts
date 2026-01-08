import "dotenv/config"
import { Effect } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import { AppLayer } from "./layers/app"
import { ConfigService } from "./services"
import { listen, logSchema } from "./server"

const program = Effect.scoped(
  Effect.gen(function* () {
    const config = yield* ConfigService
    const runtime  = yield* Effect.runtime<ConfigService>()

    yield* logSchema

    yield* listen(runtime, config.port)

    const url = `http://localhost:${config.port}/graphql`
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

