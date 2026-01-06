import {printSchema} from 'graphql';
import { weave } from "@gqloom/core"
import { EffectWeaver } from "@gqloom/effect"
import { createYoga } from "graphql-yoga"
import { createServer } from "node:http"
import { makeResolvers } from "./resolvers"

const schema = weave(EffectWeaver, ...makeResolvers())

// todo: do this in effect
console.log("Generated GraphQL Schema:\n", printSchema(schema))

const yoga = createYoga({ schema })
export const server = createServer(yoga)
