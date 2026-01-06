import { Arbitrary, Schema } from "effect"

export const NameInputSchema = Schema.Struct({
  name: Schema.NullishOr(Schema.String),
}).annotations({
  description: "Input schema for name",
})

export const NameInputSchemaArbitrary = Arbitrary.make(NameInputSchema)

export const HelloResponseSchema = Schema.String.annotations({
  description: "Response schema for hello",
})
export const HelloResponseSchemaArbitrary = Arbitrary.make(HelloResponseSchema)
