import "dotenv/config"
import { Effect } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import { AppLayer } from "./layers/app"
import { listen, logSchema } from "./graphql/server"
import { schema } from "./graphql/schema"
import { ConfigService } from "./services"

// todo: grok Effect.scoped and Effect.gen interaction better
const program = Effect.scoped(
  Effect.gen(function* () {
    const config = yield* ConfigService
    const runtime  = yield* Effect.runtime<ConfigService>()

    //todo: maybe have some service that provides the schema? and logging and serving mechanisms?
    yield* logSchema(schema)

    // todo: rename
    yield* listen(schema, runtime, config.port)

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

