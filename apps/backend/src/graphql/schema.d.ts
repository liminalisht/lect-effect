/**
 * GraphQL schema construction helpers.
 * @since 1.0.0
 */
import { weave } from '@gqloom/core';
import { type GraphQLSchema } from 'graphql';
import { Effect } from 'effect';
/**
 * Resolver type accepted by schema weaving.
 * @since 1.0.0
 * @category GraphQL Resolver Types
 */
export type GraphQLResolver = Parameters<typeof weave>[2];
/**
 * Builds the GraphQL schema from registered resolvers.
 * @since 1.0.0
 * @category GraphQL Schema Utilities
 */
export declare const makeSchema: (resolvers: readonly GraphQLResolver[]) => GraphQLSchema;
/**
 * Produces a stable SDL string for a schema.
 * @since 1.0.0
 * @category GraphQL Schema Utilities
 */
export declare const printSortedSchema: (schema: GraphQLSchema) => string;
/**
 * Logs a printable version of the schema for debugging.
 * @since 1.0.0
 * @category GraphQL Schema Utilities
 */
export declare const logSchema: (schema: GraphQLSchema) => Effect.Effect<void>;
//# sourceMappingURL=schema.d.ts.map