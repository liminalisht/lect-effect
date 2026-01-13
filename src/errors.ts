import { type SqlError } from '@effect/sql/SqlError';
import { type DomainError } from './domain/errors';
import { type GraphqlError } from './graphql/errors';
import { type ConfigurationError } from './config/errors';

// todo: this can't be right. it can't be exhaustive... but why would the compiler check then?
export type AppError =
	ConfigurationError
	| DomainError
	| GraphqlError
	| SqlError;
