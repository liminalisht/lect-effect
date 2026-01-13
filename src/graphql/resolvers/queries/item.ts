import { query, resolver } from '@gqloom/core';
import { Schema } from 'effect';
import { runEffect } from '../../effect';
import * as handlers from '../../../handlers/item';
import { itemIdInputSchema } from '../../../domain/item/itemIdInput';
import { itemSchema } from '../../../domain/item/item';

export const itemQuery = query(Schema.standardSchemaV1(Schema.NullOr(itemSchema)))
  .input(Schema.standardSchemaV1(itemIdInputSchema))
  .resolve(async args => runEffect(handlers.getItem(args.id)));

export const itemsQuery = query(Schema.standardSchemaV1(Schema.Array(itemSchema)))
  .resolve(async () => runEffect(handlers.listItems));

export const itemQueryMap = {
  item: itemQuery,
  items: itemsQuery,
};

export const itemQueryResolvers = resolver(itemQueryMap);
