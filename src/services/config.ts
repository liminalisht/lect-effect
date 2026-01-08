import { Brand, Context, LogLevel } from "effect"

export type Port = number & Brand.Brand<"Port">

// Constructor for nominally branded ports (no runtime validation yet)
export const Port = Brand.nominal<Port>()

// todo: use Effect.Service instead
export class ConfigService extends Context.Tag("ConfigService")<
  ConfigService,
  {
    readonly port: Port
    readonly logLevel: LogLevel.LogLevel
  }
>() {}


