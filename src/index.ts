
import { createServer } from "node:http"
import { NodeRuntime } from "@effect/platform-node"
import { query, resolver, weave } from "@gqloom/core"
import { EffectWeaver } from "@gqloom/effect"
import { Schema, Effect } from "effect"
import { createYoga } from "graphql-yoga"
import { getPort } from "./env"

import "dotenv/config"

const standard = Schema.standardSchemaV1

const helloResolver = resolver({
  hello: query(standard(Schema.String))
    .input({
      name: standard(Schema.NullishOr(Schema.String)),
    })
    .resolve(({ name }) => `Hello, ${name ?? "World"}!`),
})

const schema = weave(EffectWeaver, helloResolver)


const yoga = createYoga({ schema })
const server = createServer(yoga)

const program = Effect.gen(function* () {
  const port = yield* getPort

  // Start the server and wait for it to be ready
  return yield* Effect.tryPromise({
    try: () =>
      new Promise<void>((resolve) => {
        server.listen(port, () => {
          console.info(`Server is running on http://localhost:${port}/graphql`)
          resolve()
        })
      }),
    catch: (error) => new Error(`Failed to start server: ${error}`),
  })

})

NodeRuntime.runMain(program,
  {
    teardown: function customTeardown(exit, onExit) {
      if (exit._tag === "Failure") {
        console.error("Program ended with an error.")
        onExit(1)
      } else {
        console.log("Program finished successfully.")
        onExit(0)
      }
    }
  }
);

