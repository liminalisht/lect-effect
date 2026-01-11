import { Context } from "effect"
import type * as SqlClient from "@effect/sql/SqlClient"

export type MasterdataDbShape = {
  readonly sql: SqlClient.SqlClient
}

export class MasterdataDb extends Context.Tag("MasterdataDb")<
  MasterdataDb,
  MasterdataDbShape
>() {}
