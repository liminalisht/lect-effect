

### Steps
1. Simplify config service: define a single `Config` tag returning `{ port, logLevel }`, use `Layer.effect(Config, ...)` (no getters), and default PORT/LOGLEVEL with `Config.withDefault` or `Schema.Config` for validation.
2. Logger layer: `Layer.unwrapEffect(Effect.andThen(Config, ({ logLevel }) => Logger.minimumLogLevel(logLevel)))` then `Layer.provide` with `ConfigLive`; expose merged `AppLayer` that outputs `Config | Logger` and requires `never`.
3. Runtime boundary: keep one `ManagedRuntime.make(AppLayer)` (or use `Effect.runtime` inside main); attach runtime to Yoga context; provide a `runEffect(eff)` helper for resolvers via `useContext`.
4. Resolvers/handlers: keep handlers as pure Effects needing `Config|Logger`; resolvers call `runEffect` instead of threading runtime; ensure schemas use `Schema.standardSchemaV1` and clear optional/nullable annotations.
5. Server start: wrap HTTP server in `Effect.acquireRelease` to respect shutdown; main program builds schema, context, and runs server with `Effect.provide(AppLayer)`; avoid double builds/run loops.

### Further Considerations
1. Keep layers as stable singletons to benefit from memoization (no `fresh` unless intentionally needed).
2. Decide on config decoding strictness: simple `Config.number/logLevel` vs `Schema.Config` with bounds.
3. Add request-scoped context (requestId) and structured error mapping in `runEffect` if needed later.
