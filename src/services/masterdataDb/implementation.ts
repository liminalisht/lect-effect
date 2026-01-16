/**
 * MasterdataDb service implementation.
 * @since 1.0.0
 */

import { Context, Effect, Schema } from 'effect';
import type * as SqlError from '@effect/sql/SqlError';
import { type ParseError } from 'effect/ParseResult';
import * as SqlClient from '@effect/sql/SqlClient';
import { type CreateItemInput } from '../../domain/item/createItemInput';
import { itemIdSchema, type ItemId } from '../../domain/item/itemId';
import { type Item } from '../../domain/item/item';
import { type ProductId } from '../../domain/product/productId';
import { decodeMany, decodeOne } from '../../utilities/decode';
import { MasterdataDbService } from './interface';
import { ItemRepoError, ItemRepoService } from '../itemRepo/interface';

/**
 * Live implementation of the MasterdataDb service
 * @since 1.0.0
 */
export const masterdataDbImplementation
  = Effect.gen(function * () {
    const sql = yield * SqlClient.SqlClient;
    yield * Effect.logInfo('masterdata Postgres client initialized');
    return { sql } as const; // todo: what's the point of this?
  });
