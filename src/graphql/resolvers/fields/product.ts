/**
 * Field resolvers for the Product type.
 * @since 1.0.0
 */
import { field, resolver } from '@gqloom/core';
import { Schema } from 'effect';
import { runEffect } from '../../effect';
import { productSchema, type Product } from '../../../domain/product/product';
import { itemSchema } from '../../../domain/item/item';
import { itemsForProduct } from '../../../handlers/product';

const itemsForProductField = field(Schema.standardSchemaV1(Schema.Array(itemSchema))) // todo: extract proper schema w/ Array
  .description('List all items associated with the product.')
  .resolve(async (parent: Product) => runEffect(itemsForProduct(parent.id)));
/**
 * Resolver map for Product fields.
 * @since 1.0.0
 */
export const productFieldResolvers = resolver.of(
  Schema.standardSchemaV1(productSchema),
  {
    itemsForProduct: itemsForProductField,
  },
);
