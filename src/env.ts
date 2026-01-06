import { Config, Effect } from "effect"

/**
 * Loads the PORT number from the environment using Effect's Config module.
 * Throws if PORT is not set or not a valid number.
 */
export const getPort = Effect.gen(function* () {
	const port = yield* Config.number("PORT")
	return port
})
