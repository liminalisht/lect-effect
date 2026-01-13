/**
 * Field resolvers for the Product type.
 * @since 1.0.0
 */
import { field, resolver } from '@gqloom/core';
import { Schema } from 'effect';
import { runEffect } from '../../effect';
import { productSchema } from '../../../domain/product/product';
import { itemSchema } from '../../../domain/item/item';
import { itemsForProduct } from '../../../handlers/product';

/**
 * Resolver map for Product fields.
 * @since 1.0.0
 */
export const productFieldResolvers = resolver.of(
  Schema.standardSchemaV1(productSchema),
  {
    itemsForProduct: field(Schema.standardSchemaV1(Schema.Array(itemSchema)))
      .resolve(async parent => runEffect(itemsForProduct(parent.id))),
  },
);
