/**
 * GraphQL schema construction helpers.
 * @since 1.0.0
 */
import {weave} from '@gqloom/core';
import {asyncContextProvider} from '@gqloom/core/context';
import {EffectWeaver} from '@gqloom/effect';
import {lexicographicSortSchema, printSchema} from 'graphql';
import {Effect} from 'effect';
/**
 * Builds the GraphQL schema from registered resolvers.
 * @since 1.0.0
 * @category GraphQL Schema Utilities
 */
export const makeSchema = resolvers => weave(EffectWeaver, asyncContextProvider, ...resolvers);
/**
 * Produces a stable SDL string for a schema.
 * @since 1.0.0
 * @category GraphQL Schema Utilities
 */
export const printSortedSchema = schema => printSchema(lexicographicSortSchema(schema));
/**
 * Logs a printable version of the schema for debugging.
 * @since 1.0.0
 * @category GraphQL Schema Utilities
 */
export const logSchema = schema => Effect.gen(function * () {
	const schemaString = printSortedSchema(schema);
	yield * Effect.logDebug('generating graphql schema...');
	yield * Effect.logDebug(`\n${schemaString}`);
});
