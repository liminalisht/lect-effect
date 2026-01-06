import { Config, ConfigError, Effect } from "effect"

/**
 * Loads the PORT number from the environment using Effect's Config module.
 */
export const getPort : Effect.Effect<number, ConfigError.ConfigError, never>
  = Effect.gen(function* () {
    const port = yield* Config.number("PORT")
    return port
  })
