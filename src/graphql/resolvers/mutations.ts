import { mutation, resolver } from '@gqloom/core';
import { Schema } from 'effect';
import { runEffect } from '../effect';
import { createItemInputSchema } from '../../domain/item/createItemInput';
import { itemSchema } from '../../domain/item/item';
import { productSchema } from '../../domain/product/product';
import { productInputSchema } from '../../domain/product/productInput';
import { createItem } from '../../handlers/item';
import { createProduct, createProductWithItems } from '../../handlers/product';
import { createProductWithItemsInputSchema } from '../../domain/product/createProductWithItemsInput';
import { productWithItemsSchema } from '../../domain/product/productWithItems';

export const createItemMutation = mutation(Schema.standardSchemaV1(itemSchema))
  .input(Schema.standardSchemaV1(createItemInputSchema))
  .resolve(async args => runEffect(createItem(args)));

export const createProductMutation = mutation(Schema.standardSchemaV1(productSchema))
  .input(Schema.standardSchemaV1(productInputSchema))
  .resolve(async args => runEffect(createProduct(args)));

export const createProductWithItemsMutation = mutation(Schema.standardSchemaV1(productWithItemsSchema))
  .input(Schema.standardSchemaV1(createProductWithItemsInputSchema))
  .resolve(async args => runEffect(createProductWithItems(args)));

export const mutationsMap = {
  createItem: createItemMutation,

  createProduct: createProductMutation,

  createProductWithItems: createProductWithItemsMutation,
};

export const mutationsResolver = resolver(mutationsMap);
