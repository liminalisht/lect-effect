
import { createServer } from "node:http"
import { query, resolver, weave } from "@gqloom/core"
import { EffectWeaver } from "@gqloom/effect"
import { Schema } from "effect"
import { createYoga } from "graphql-yoga"

const standard = Schema.standardSchemaV1

// Effect-native schemas (usable for arbitraries, validation, etc.)
const NameInputSchema = Schema.Struct({
  name: Schema.NullishOr(Schema.String),
})
const HelloResponseSchema = Schema.String

// Standardized schemas for gqloom/graphql-yoga
const NameInputStandard = standard(NameInputSchema)
const HelloResponseStandard = standard(HelloResponseSchema)

const helloResolver = resolver({
  hello: query(HelloResponseStandard)
    .input(NameInputStandard)
    .resolve(({ name }) => `Hello, ${name ?? "World"}!`),
})

const schema = weave(EffectWeaver, helloResolver)
const yoga = createYoga({ schema })
export const server = createServer(yoga)
