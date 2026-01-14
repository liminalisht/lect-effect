/**
 * GraphQL item query resolvers.
 * @since 1.0.0
 */
import { query, resolver } from '@gqloom/core';
import { Schema } from 'effect';
import { runEffect } from '../../effect';
import * as handlers from '../../../handlers/item';
import { itemIdInputSchema } from '../../../domain/item/itemIdInput';
import { itemSchema } from '../../../domain/item/item';

/**
 * Query for fetching a single item.
 * @since 1.0.0
 */
export const itemQuery = query(Schema.standardSchemaV1(Schema.NullOr(itemSchema))) // todo: extract proper schema w/ NullOr
  .description('Fetch a single item by its ID.')
  .input(Schema.standardSchemaV1(itemIdInputSchema))
  .resolve(async args => runEffect(handlers.getItem(args.id)));

/**
 * Query for listing items.
 * @since 1.0.0
 */
export const itemsQuery = query(Schema.standardSchemaV1(Schema.Array(itemSchema))) // todo: extract proper schema w/ Array
  .description('List all available items.')
  .resolve(async () => runEffect(handlers.listItems));

/**
 * Map of item queries.
 * @since 1.0.0
 */
export const itemQueryMap = {
  item: itemQuery,
  items: itemsQuery,
};

/**
 * Resolver for item queries.
 * @since 1.0.0
 */
export const itemQueryResolvers = resolver(itemQueryMap);
