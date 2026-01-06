import { weave } from "@gqloom/core"
import { EffectWeaver } from "@gqloom/effect"
import { createYoga } from "graphql-yoga"
import { createServer } from "node:http"
import { resolvers } from "./resolvers"

const schema = weave(EffectWeaver, ...resolvers)
const yoga = createYoga({ schema })
export const server = createServer(yoga)
