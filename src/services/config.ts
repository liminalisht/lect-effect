import { Brand, Context, LogLevel } from "effect"

export type Port = number & Brand.Brand<"Port">

// Constructor for nominally branded ports (no runtime validation yet)
export const Port = Brand.nominal<Port>()

export class AppConfigService extends Context.Tag("AppConfigService")<
  AppConfigService,
  {
    readonly port: Port
    readonly logLevel: LogLevel.LogLevel
  }
>() {}


