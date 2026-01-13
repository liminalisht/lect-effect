import { Schema } from 'effect';

export type PackSize = Schema.Schema.Type<typeof packSizeSchema>;

// todo: add non-negative constraint, greater than 0
export const packSizeSchema = Schema.Number.pipe(Schema.int()).annotations({
  description: 'item pack size',
});
