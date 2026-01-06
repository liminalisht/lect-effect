import { Effect } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import { AppLayer, getPort } from "./env"
import { ServerStartError } from "./errors"
import { server } from "./server"

import "dotenv/config"

const runServer = Effect.gen(function* () {
  console.info("Bootstrapping server...")
  const port = yield* getPort
  console.info(`Starting HTTP server on port ${port}...`)
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

NodeRuntime.runMain(runServer.pipe(Effect.provide(AppLayer)),
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

