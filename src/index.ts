
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

NodeRuntime.runMain(
  Effect.async<void>((resume) => {
    getPort.pipe(Effect.runPromise).then((port) => {
      server.listen(port, () => {
        console.info(`Server is running on http://localhost:${port}/graphql`)
      })
    })

    const shutdown = () => {
      server.close(() => {
        console.info("Server closed. Exiting.")
        resume()
      })
    }
    process.once("SIGINT", shutdown)
    process.once("SIGTERM", shutdown)
    // If resume is called (e.g. by error), remove listeners
    return () => {
      process.off("SIGINT", shutdown)
      process.off("SIGTERM", shutdown)
      server.close()
    }
  })
)
