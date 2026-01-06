import { Arbitrary, Schema } from "effect"

//todo: determine why these descriptions don't show up in GraphQL Playground
export const NameInputSchema = Schema.Struct({
  name: Schema.NullishOr(Schema.String).annotations({
    description: "Optional name to greet",
  }),
}).annotations({
  description: "Input schema for name",
})
export type NameInput = Schema.Schema.Type<typeof NameInputSchema>
export const NameInputArbitrary = Arbitrary.make(NameInputSchema)

export const HelloResponseSchema = Schema.String.annotations({
  description: "Response schema for hello",
})
export type HelloResponse = Schema.Schema.Type<typeof HelloResponseSchema>
export const HelloResponseArbitrary = Arbitrary.make(HelloResponseSchema)

export const NameInputStandard = Schema.standardSchemaV1(
  NameInputSchema.annotations({
    description: "NameInput",
  }),
)

export const HelloResponseStandard = Schema.standardSchemaV1(
  HelloResponseSchema.annotations({
    description: "HelloResponse",
  }),
)

