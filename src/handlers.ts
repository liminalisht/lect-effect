import { Effect } from "effect"
import * as schemas from "./schemas"

export const helloHandler = (
	input: schemas.NameInput,
): Effect.Effect<schemas.HelloResponse> =>
	Effect.gen(function* () {
		const who = input.name ?? "World"
    // todo: this should not use the effect default logger.
    // todo: we should have a way to get the app logger
		yield* Effect.logInfo(`helloHandler greeting ${who}`)
		yield* Effect.logDebug(`helloHandler debug`)

		return { greeting: `Hello, ${who}!` }
	})
