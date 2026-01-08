import { weave } from "@gqloom/core"
import { EffectWeaver } from "@gqloom/effect"
import { asyncContextProvider } from "@gqloom/core/context"
import { makeResolvers } from "./resolvers"

// asyncContextProvider is enabled, so you can just read the GraphQLContext via useContext.
// todo: can't i make this use Effect?
export const schema = weave(EffectWeaver, asyncContextProvider, ...makeResolvers())
