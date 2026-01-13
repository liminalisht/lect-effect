import { field, query, resolver } from '@gqloom/core';
import { Schema } from 'effect';
import { runEffect } from '../effect';
import * as handlers from '../../handlers/item';
import { itemIdInputSchema, itemSchema } from '../../domain/item';
import { productSchema } from '../../domain/product';

export const itemQuery = query(Schema.standardSchemaV1(Schema.NullOr(itemSchema)))
  .input(Schema.standardSchemaV1(itemIdInputSchema))
  .resolve(async (args) => runEffect(handlers.getItem(args.id)));

export const itemsQuery = query(Schema.standardSchemaV1(Schema.Array(itemSchema)))
  .resolve(async () => runEffect(handlers.listItems));

export const itemQueryMap = {
  item: itemQuery,
  items: itemsQuery,
};

export const itemResolvers = resolver(itemQueryMap);

export const itemFieldResolvers = resolver.of(
  Schema.standardSchemaV1(itemSchema),
  {
    productForItem: field(Schema.standardSchemaV1(Schema.NullOr(productSchema)))
      .resolve(async parent => runEffect(handlers.productForItem(parent.id))),
  },
);
