import { type ConfigError } from 'effect';
import { type SqlError } from '@effect/sql/SqlError';
import { type GraphQLServerError } from './graphql/errors';

export type AppError = ConfigError.ConfigError | GraphQLServerError | SqlError;
