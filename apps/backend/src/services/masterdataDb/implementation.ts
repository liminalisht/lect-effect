/**
 * MasterdataDb service implementation.
 * @since 0.1.0
 */

import { Effect } from 'effect';
import * as SqlClient from '@effect/sql/SqlClient';
import { type MasterdataDb } from '@lect-effect/services/masterdataDb';

/**
 * Live implementation of the MasterdataDb service
 * @since 0.1.0
 * @category Service Implementations
 */
export const masterdataDbImplementation: Effect.Effect<MasterdataDb, never, SqlClient.SqlClient>
  = Effect.gen(function * () {
    const sql = yield * SqlClient.SqlClient;
    return { sql } as const; // todo: what's the point of this?
  });
