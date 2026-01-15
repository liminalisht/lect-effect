import { Context } from "effect"
import { type PgClientConfig } from "@effect/sql-pg/PgClient"

export class PgClientConfigService extends Context.Tag('PgClientConfigService')<PgClientConfigService, PgClientConfig>() {}

