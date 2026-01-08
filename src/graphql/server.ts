import { Effect } from "effect"
import type { Runtime } from "effect"
import { GraphQLSchema, lexicographicSortSchema, printSchema } from "graphql"
import { createYoga } from "graphql-yoga"
import { createServer, type Server } from "node:http"
import type { ConfigService } from "../services"
import type { GraphQLContext } from "./context"

export const logSchema = (schema: GraphQLSchema) => Effect.gen(function* () {
    const schemaString = printSchema(lexicographicSortSchema(schema))
    yield* Effect.logDebug("generating graphql schema...")
    yield* Effect.logDebug(`\n${schemaString}`)
})

// todo: grok Effect acquireRelease and Effect.async better to see if this can be simplified
export const listen = (schema: GraphQLSchema, runtime: Runtime.Runtime<ConfigService>, port: number) =>
	Effect.acquireRelease(
		Effect.async<Server, unknown>((resume, signal) => {
			const yoga = createYoga<GraphQLContext>({
				schema,
				context: (initial) => ({ ...initial, runtime }),
			})

			const server = createServer(yoga)

			const onError = (error: unknown) => resume(Effect.fail(error))
			server.on("error", onError)

			server.listen(port, () => resume(Effect.succeed(server)))

			if (signal.aborted) {
				return Effect.sync(() => {
					server.off("error", onError)
					server.close(() => undefined)
				})
			}

			const onAbort = () => {
				server.off("error", onError)
				server.close(() => undefined)
			}

			signal.addEventListener("abort", onAbort)

			return Effect.sync(() => {
				signal.removeEventListener("abort", onAbort)
				server.off("error", onError)
				server.close(() => undefined)
			})
		}),
		(server) =>
			Effect.async<void>((resume) => {
				server.close(() => resume(Effect.succeed(undefined)))
			})
	)
