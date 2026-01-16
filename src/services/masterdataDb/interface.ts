/**
 * Masterdata database service contract.
 * @since 1.0.0
 */
import { Context } from 'effect';
import type * as SqlClient from '@effect/sql/SqlClient';

// todo: rename to MasterdataDb?
/**
 * Shape for the masterdata database service.
 * @since 1.0.0
 */
export type MasterdataDbShape = {
  readonly sql: SqlClient.SqlClient;
};

// todo: rename to MasterdataService?
/**
 * Service tag for accessing the masterdata database client.
 * @since 1.0.0
 */
export class MasterdataDbService extends Context.Tag('MasterdataDb')<
  MasterdataDbService,
  MasterdataDbShape
>() {}
