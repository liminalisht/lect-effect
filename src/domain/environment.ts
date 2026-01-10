import { Schema } from 'effect';

export const environmentSchema = Schema.Literal('dev', 'test', 'staging', 'prod');

export type Environment = Schema.Schema.Type<typeof environmentSchema>;
