import { Arbitrary, Schema } from "effect"
import { asField } from "@gqloom/effect"

export const NameSchema = Schema.String.annotations({
  title: "Name",
  description: "Name to greet",
})
export type Name = Schema.Schema.Type<typeof NameSchema>
export const NameArbitrary = Arbitrary.make(NameSchema)

export const NameInputSchema = Schema.Struct({
  name: Schema.NullishOr(NameSchema).annotations({
    description: "Optional name to greet",
  }),
}).annotations({
  title: "NameInput",
  description: "Input schema for name",
})
export type NameInput = Schema.Schema.Type<typeof NameInputSchema>
export const NameInputArbitrary = Arbitrary.make(NameInputSchema)

export const HelloResponseSchema = Schema.String.annotations({
  title: "HelloResponse",
  description: "Response schema for hello",
  [asField]: {
    description: "Greets the caller, optionally using the provided name",
  },
})
export type HelloResponse = Schema.Schema.Type<typeof HelloResponseSchema>
export const HelloResponseArbitrary = Arbitrary.make(HelloResponseSchema)

export const NameInputStandard = Schema.standardSchemaV1(NameInputSchema)

export const HelloResponseStandard = Schema.standardSchemaV1(HelloResponseSchema)

