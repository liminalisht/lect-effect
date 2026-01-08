import { weave } from "@gqloom/core"
import { EffectWeaver } from "@gqloom/effect"
import { makeResolvers } from "./resolvers"

export const schema = weave(EffectWeaver, ...makeResolvers())
