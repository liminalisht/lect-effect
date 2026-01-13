/**
 * Field resolvers for the Item type.
 * @since 1.0.0
 */
import { field, resolver } from '@gqloom/core';
import { Schema } from 'effect';
import { runEffect } from '../../effect';
import { itemSchema } from '../../../domain/item/item';
import { productSchema } from '../../../domain/product/product';
import { productForItem } from '../../../handlers/item';

/**
 * Resolver map for Item fields.
 * @since 1.0.0
 */
export const itemFieldResolvers = resolver.of(
  Schema.standardSchemaV1(itemSchema),
  {
    productForItem: field(Schema.standardSchemaV1(Schema.NullOr(productSchema)))
      .resolve(async parent => runEffect(productForItem(parent.id))),
  },
);
