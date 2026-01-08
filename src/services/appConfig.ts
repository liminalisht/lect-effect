import { Context, LogLevel } from "effect"

export class AppConfig extends Context.Tag("AppConfig")<
  AppConfig,
  {
    readonly port: number
    readonly logLevel: LogLevel.LogLevel
  }
>() {}

