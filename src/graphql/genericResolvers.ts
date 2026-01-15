import { Schema } from 'effect';
import { productSchema, type Product } from '../domain/product/product';
import { itemSchema } from '../domain/item/item';
import { createProductWithItemsMutation, getProduct, getProductWithItemsQuery, itemsForProduct, productHandlers } from '../handlers/product';
import { handlersToResolvers } from './generic';
import { ProductIdInput, productIdInputSchema } from '../domain/product/productIdInput';
import { greetQuery, helloHandlers } from '../handlers/hello';
import { createItemMutation, getItem, getItemQuery, itemHandlers, listItemsQuery, productForItemField } from '../handlers/item';

export const exampleResolvers = handlersToResolvers([
  ...helloHandlers,
  ...itemHandlers,
  ...productHandlers,
]);
