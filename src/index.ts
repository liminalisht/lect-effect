
import { createServer } from "node:http"
import { NodeRuntime } from "@effect/platform-node"
import { query, resolver, weave } from "@gqloom/core"
import { EffectWeaver } from "@gqloom/effect"
import { Schema, Effect } from "effect"
import { createYoga } from "graphql-yoga"
import { getPort } from "./env"
import { ServerStartError } from "./errors"
import { server } from "./server"

import "dotenv/config"

const runServer = Effect.gen(function* () {
  const port = yield* getPort
  return yield* Effect.tryPromise({
    try: () =>
      new Promise<void>((resolve) => {
        server.listen(port, () => {
          console.info(`Server is running on http://localhost:${port}/graphql`)
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

