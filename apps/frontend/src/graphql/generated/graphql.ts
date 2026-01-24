import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

/** input for creating an item */
export type CreateItemInput = {
  /** item description (nullable & optional) */
  description: InputMaybe<Scalars['String']['input']>;
  /** item pack size */
  pack_size: Scalars['Int']['input'];
};

export type CreateProductWithItemsProductInput = {
  /** product description (nullable & optional) */
  description: InputMaybe<Scalars['String']['input']>;
};

export type GetProductWithItems = {
  __typename?: 'GetProductWithItems';
  items: Array<Item>;
  /** product */
  product: Product;
};

/** response to hello query */
export type HelloResponse = {
  __typename?: 'HelloResponse';
  /** greeting message */
  greeting: Scalars['String']['output'];
};

/** item */
export type Item = {
  __typename?: 'Item';
  /** item description (nullable) */
  description: Maybe<Scalars['String']['output']>;
  /** item identifier */
  id: Scalars['Int']['output'];
  /** item pack size */
  pack_size: Scalars['Int']['output'];
  /** product for this item */
  product: Maybe<Product>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** create a new item */
  createItem: Item;
  /** create product */
  createProduct: Product;
  /** create product and its items */
  createProductWithItems: GetProductWithItems;
};


export type MutationCreateItemArgs = {
  description: InputMaybe<Scalars['String']['input']>;
  pack_size: Scalars['Int']['input'];
};


export type MutationCreateProductArgs = {
  description: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateProductWithItemsArgs = {
  items: Array<CreateItemInput>;
  product: CreateProductWithItemsProductInput;
};

/** product */
export type Product = {
  __typename?: 'Product';
  /** product description (nullable) */
  description: Maybe<Scalars['String']['output']>;
  /** product identifier */
  id: Scalars['Int']['output'];
  /** items for this product */
  items: Array<Item>;
};

export type Query = {
  __typename?: 'Query';
  /** get item by id */
  getItem: Maybe<Item>;
  /** get product by id */
  getProduct: Maybe<Product>;
  /** get product and its items by id */
  getProductWithItems: Maybe<GetProductWithItems>;
  /** greet a user by name */
  greet: HelloResponse;
  /** list all items */
  listItems: Array<Item>;
  /** list all products */
  listProducts: Array<Product>;
};


export type QueryGetItemArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGetProductArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGetProductWithItemsArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGreetArgs = {
  name: InputMaybe<Scalars['String']['input']>;
};

export type CreateProductWithItemsMutationVariables = Exact<{
  product: CreateProductWithItemsProductInput;
  items: Array<CreateItemInput> | CreateItemInput;
}>;


export type CreateProductWithItemsMutation = { __typename?: 'Mutation', createProductWithItems: { __typename?: 'GetProductWithItems', product: { __typename: 'Product', id: number, description: string | null }, items: Array<{ __typename?: 'Item', id: number, description: string | null, pack_size: number }> } };

export type HelloQueryVariables = Exact<{
  name: InputMaybe<Scalars['String']['input']>;
}>;


export type HelloQuery = { __typename?: 'Query', greet: { __typename?: 'HelloResponse', greeting: string } };


export const CreateProductWithItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProductWithItems"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"product"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProductWithItemsProductInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"items"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateItemInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProductWithItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"product"},"value":{"kind":"Variable","name":{"kind":"Name","value":"product"}}},{"kind":"Argument","name":{"kind":"Name","value":"items"},"value":{"kind":"Variable","name":{"kind":"Name","value":"items"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"pack_size"}}]}}]}}]}}]} as unknown as DocumentNode<CreateProductWithItemsMutation, CreateProductWithItemsMutationVariables>;
export const HelloDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Hello"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"greet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"greeting"}}]}}]}}]} as unknown as DocumentNode<HelloQuery, HelloQueryVariables>;