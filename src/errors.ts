import { type ConfigError } from 'effect';
import { type GraphQLServerError } from './graphql/errors';

export type AppError = ConfigError.ConfigError | GraphQLServerError;
