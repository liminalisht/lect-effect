import { Effect } from "effect"
import * as schemas from "./schemas"

export const helloHandler = (
	input: schemas.NameInput,
): Effect.Effect<schemas.HelloResponse> =>
	Effect.gen(function* () {
		const who = input.name ?? "World"
		yield* Effect.logInfo(`helloHandler greeting ${who}`)
		return { greeting: `Hello, ${who}!` }
	})
