import { Schema } from 'effect';

export type Name = Schema.Schema.Type<typeof nameSchema>;

export const nameSchema = Schema.String;
