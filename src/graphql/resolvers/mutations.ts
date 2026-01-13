import { mutation, resolver } from '@gqloom/core';
import { Schema } from 'effect';
import { runEffect } from '../effect';
import * as itemHandlers from '../../handlers/item';
import * as productHandlers from '../../handlers/product';
import { createItemInputSchema, itemSchema } from '../../domain/item';
import { productInputSchema, productSchema } from '../../domain/product';
import {
  createProductWithItemsInputSchema,
  productWithItemsSchema,
} from '../../domain/productWithItems';

export const createItemMutation = mutation(Schema.standardSchemaV1(itemSchema))
  .input(Schema.standardSchemaV1(createItemInputSchema))
  .resolve(async (args) => runEffect(itemHandlers.createItem(args)));

export const createProductMutation = mutation(Schema.standardSchemaV1(productSchema))
  .input(Schema.standardSchemaV1(productInputSchema))
  .resolve(async (args) => runEffect(productHandlers.createProduct(args)));

export const createProductWithItemsMutation = mutation(Schema.standardSchemaV1(productWithItemsSchema))
  .input(Schema.standardSchemaV1(createProductWithItemsInputSchema))
  .resolve(async (args) => runEffect(productHandlers.createProductWithItems(args)));

export const mutationsMap = {
  createItem: createItemMutation,

  createProduct: createProductMutation,

  createProductWithItems: createProductWithItemsMutation,
};

export const mutationsResolver = resolver(mutationsMap);
