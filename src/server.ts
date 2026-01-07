import {lexicographicSortSchema, printSchema} from 'graphql';
import { weave } from "@gqloom/core"
import { EffectWeaver } from "@gqloom/effect"
import { createYoga } from "graphql-yoga"
import { createServer } from "node:http"
import { makeResolvers } from "./resolvers"

const schema = weave(EffectWeaver, ...makeResolvers())

// todo: can we do this in effect? as a matter of fact, can we do the above
// and below in effect too?
console.log("Generated GraphQL Schema:\n", printSchema(lexicographicSortSchema(schema)))

const yoga = createYoga({ schema })
export const server = createServer(yoga)
