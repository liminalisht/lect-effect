import { type SqlError } from '@effect/sql/SqlError';
import { type GraphqlError } from './graphql/errors';
import { ConfigurationError } from './config/errors';

// todo: this can't be right. it can't be exhaustive
export type AppError = ConfigurationError | GraphqlError | SqlError;
