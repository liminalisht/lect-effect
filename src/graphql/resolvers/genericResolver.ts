// makeResolver.ts
import { resolver } from '@gqloom/core';
import { genericQuery, genericMutation, genericField } from './generic';
import type { HandlerWithMeta } from './generic'; // your withMeta type
import { Schema } from 'effect';

// Helper to register queries (supports 0-arg via Schema.Void or 1-arg)
export const registerQueries = (
  entries: Array<{ key: string; handler: HandlerWithMeta<any, any, any, any> }>,
) =>
  entries.reduce<Record<string, ReturnType<typeof genericQuery>>>((acc, { key, handler }) => {
    const { input, output, description } = handler.meta;
    acc[key] = genericQuery(input, output, description, handler as any);
    return acc;
  }, {});

// Helper to register mutations
export const registerMutations = (
  entries: Array<{ key: string; handler: HandlerWithMeta<any, any, any, any> }>,
) =>
  entries.reduce<Record<string, ReturnType<typeof genericMutation>>>((acc, { key, handler }) => {
    const { input, output, description } = handler.meta;
    acc[key] = genericMutation(input, output, description, handler as any);
    return acc;
  }, {});

// Helper to register fields (parent schema is handled by resolver.of elsewhere)
export const registerFields = (
  entries: Array<{ key: string; handler: HandlerWithMeta<any, any, any, any> }>,
) =>
  entries.reduce<Record<string, ReturnType<typeof genericField>>>((acc, { key, handler }) => {
    const { output, description } = handler.meta;
    acc[key] = genericField(output, description, handler as any);
    return acc;
  }, {});

// Putting it together: makeResolver
export const makeResolver = ({
  queries = [],
  mutations = [],
  fields = [],
  parentSchema, // for resolver.of on field resolvers
}: {
  queries?: Array<{ key: string; handler: HandlerWithMeta<any, any, any, any> }>;
  mutations?: Array<{ key: string; handler: HandlerWithMeta<any, any, any, any> }>;
  fields?: Array<{ key: string; handler: HandlerWithMeta<any, any, any, any> }>;
  parentSchema?: Schema.Schema.AnyNoContext; // only needed for fields
}) => {
  const queryMap = registerQueries(queries);
  const mutationMap = registerMutations(mutations);
  const fieldMap = registerFields(fields);

  return {
    queries: Object.keys(queryMap).length ? resolver(queryMap) : undefined,
    mutations: Object.keys(mutationMap).length ? resolver(mutationMap) : undefined,
    fields:
      parentSchema && Object.keys(fieldMap).length
        ? resolver.of(parentSchema as any, fieldMap)
        : undefined,
  };
};
