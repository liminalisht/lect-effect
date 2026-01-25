/**
 * Application error union definitions.
 * @since 1.0.0
 */
import { type SqlError } from '@effect/sql/SqlError';
import { type DomainError } from '@lect-effect/domain/errors';
import { type ConfigurationError } from '@lect-effect/services/errors';
import { type GraphqlError } from './graphql/errors.js';

// todo: this can't be right. it can't be exhaustive... but why would the compiler check then?
// where is ItemRepoError, e.g.? is that getting caught or transformed or pattern-matched away somewhere else?
/**
 * Union type of all application-specific errors.
 * @since 1.0.0
 * @category Application Errors
 */
export type AppError =
	ConfigurationError
	| DomainError
	| GraphqlError
	| SqlError;
