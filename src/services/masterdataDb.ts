import { Context } from 'effect';
import type * as SqlClient from '@effect/sql/SqlClient';

// todo: rename to MasterdataDbServiceShape?
export type MasterdataDbShape = {
  readonly sql: SqlClient.SqlClient;
};

// todo: rename to MasterdataService?
export class MasterdataDb extends Context.Tag('MasterdataDb')<
  MasterdataDb,
  MasterdataDbShape
>() {}
