import * as schemas from "./schemas"

export const helloHandler = (input: schemas.NameInput): schemas.HelloResponse => {
	const who = input.name ?? "World"
	return { greeting: `Hello, ${who}!` }
}
