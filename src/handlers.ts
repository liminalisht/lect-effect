import * as schemas from "./schemas"

export const helloHandler = (input: schemas.NameInput) => `Hello, ${input.name}!`
