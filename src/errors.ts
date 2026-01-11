import { type ConfigError } from 'effect';
import { type GraphQLServerError } from './graphql/errors';
import { SqlError } from '@effect/sql/SqlError';

export type AppError = ConfigError.ConfigError | GraphQLServerError | SqlError;
