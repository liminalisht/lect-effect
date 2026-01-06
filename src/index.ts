import { Effect } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import { getPort } from "./env"
import { ServerStartError } from "./errors"
import { server } from "./server"

import "dotenv/config"

// todo: create layers, including Config, Logger, etc.
// todo: make effect services available to resolvers

const runServer = Effect.gen(function* () {
  const port = yield* getPort
  return yield* Effect.tryPromise({
    try: () =>
      new Promise<void>((resolve) => {
        server.listen(port, () => {
          const url = `http://localhost:${port}/graphql`
          console.info(`Server is running on ${url}`)
          resolve()
        })
      }),
    catch: (error) => new ServerStartError({ error }),
  })
})

NodeRuntime.runMain(runServer,
  {
    teardown: function customTeardown(exit, onExit) {
      if (exit._tag === "Failure") {
        console.error("Program ended with an error.", exit.cause)
        onExit(1)
      } else {
        onExit(0)
      }
    }
  }
);

