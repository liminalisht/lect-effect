import { Schema } from "effect"

export const NameInputSchema = Schema.Struct({
  name: Schema.NullishOr(Schema.String),
})
export const HelloResponseSchema = Schema.String
