// // todo: add tests for resolvers
import { field, query, resolver } from '@gqloom/core';
import { Schema } from 'effect';
import { runEffect } from '../../effect';
import { productSchema } from '../../../domain/product/product';
import { itemSchema } from '../../../domain/item/item';
import { itemsForProduct } from '../../../handlers/product';


export const productFieldResolvers = resolver.of(
  Schema.standardSchemaV1(productSchema),
  {
    itemsForProduct: field(Schema.standardSchemaV1(Schema.Array(itemSchema)))
      .resolve(async parent => runEffect(itemsForProduct(parent.id))),
  },
);
