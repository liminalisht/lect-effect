import { weave } from "@gqloom/core"
import { EffectWeaver } from "@gqloom/effect"
import { lexicographicSortSchema, printSchema } from "graphql"
import { createYoga } from "graphql-yoga"
import { createServer, type Server } from "node:http"
import { Effect } from "effect"
import type { Runtime } from "effect"
import { makeResolvers } from "./resolvers"
import type { AppConfig } from "./services"
import type { GraphQLContext } from "./context"

export const schema = weave(EffectWeaver, ...makeResolvers())

export const logSchema = Effect.sync(() => {
	const sorted = lexicographicSortSchema(schema)
	console.log("Generated GraphQL Schema:\n", printSchema(sorted))
})

export const listen = (runtime: Runtime.Runtime<AppConfig>, port: number) =>
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
