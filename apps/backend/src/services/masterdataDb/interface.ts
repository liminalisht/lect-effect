/**
 * Masterdata database service contract.
 * @since 1.0.0
 */
import { Context } from 'effect';
import type * as SqlClient from '@effect/sql/SqlClient';

/**
 * Shape for the masterdata database service.
 * @since 1.0.0
 * @category Service Interfaces
 */
export type MasterdataDb = {
  readonly sql: SqlClient.SqlClient;
};

// todo: rename to MasterdataService?
/**
 * Service tag for accessing the masterdata database client.
 * @since 1.0.0
 * @category Services
 */
export class MasterdataDbService extends Context.Tag('services/masterdataDb')<
  MasterdataDbService,
  MasterdataDb
>() {}
