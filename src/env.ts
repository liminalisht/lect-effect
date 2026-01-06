import { Config, ConfigError, Effect } from "effect"

export const getPort : Effect.Effect<number, ConfigError.ConfigError, never>
  = Effect.gen(function* () {
    const port = yield* Config.number("PORT")
    return port
  })
