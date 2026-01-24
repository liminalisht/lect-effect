/**
 * Helpers for turning typed handlers into gqloom resolvers.
 * @since 1.0.0
 */
import {
	field, mutation, query, resolver,
} from '@gqloom/core';
import {Schema} from 'effect';
import {runEffect} from './effect.js';
/**
 * Converts handler definitions into gqloom resolvers while preserving types.
 * @since 1.0.0
 * @category GraphQL Resolver Utilities
 */
export const handlersToResolvers = handlers => handlers.map(handler => handlerToResolver(handler));
/**
 * Dispatches a handler to the appropriate resolver factory.
 * @since 1.0.0
 * @category GraphQL Resolver Utilities
 */
export const handlerToResolver = handler => {
	switch (handler.kind) {
		case 'field': {
			return genericFieldResolver({
				key: handler.key,
				descriptionString: handler.descriptionString,
				parentSchema: handler.parentSchema,
				inputSchema: handler.inputSchema,
				outputSchema: handler.outputSchema,
				handler: handler.handler,
			});
		}

		case 'query': {
			return genericQueryResolver({
				key: handler.key,
				descriptionStr: handler.descriptionString,
				inputSchema: handler.inputSchema,
				outputSchema: handler.outputSchema,
				handler: handler.handler,
			});
		}

		case 'mutation': {
			return genericMutationResolver({
				key: handler.key,
				descriptionStr: handler.descriptionString,
				inputSchema: handler.inputSchema,
				outputSchema: handler.outputSchema,
				handler: handler.handler,
			});
		}
	}
};

/**
 * Builds a typed field resolver for gqloom.
 * @since 1.0.0
 * @category GraphQL Resolver Utilities
 */
export const genericFieldResolver = config => resolver.of(Schema.standardSchemaV1(config.parentSchema), {
	[config.key]: field(Schema.standardSchemaV1(config.outputSchema))
		.description(config.descriptionString)
		.input(Schema.standardSchemaV1(config.inputSchema))
		.resolve(async (parent, input) => runEffect(config.handler(parent, input))),
});
/**
 * Builds a typed mutation resolver for gqloom.
 * @since 1.0.0
 * @category GraphQL Resolver Utilities
 */
export const genericMutationResolver = config => resolver({
	[config.key]: mutation(Schema.standardSchemaV1(config.outputSchema))
		.description(config.descriptionStr)
		.input(Schema.standardSchemaV1(config.inputSchema))
		.resolve(async input => runEffect(config.handler(input))),
});
/**
 * Builds a typed query resolver for gqloom.
 * @since 1.0.0
 * @category GraphQL Resolver Utilities
 */
export const genericQueryResolver = config => resolver({
	[config.key]: query(Schema.standardSchemaV1(config.outputSchema))
		.description(config.descriptionStr)
		.input(Schema.standardSchemaV1(config.inputSchema))
		.resolve(async input => runEffect(config.handler(input))),
});
