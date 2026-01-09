import { Schema } from 'effect';
import { nameSchema } from './name';

export type NameInput = Schema.Schema.Type<typeof nameInputSchema>;

export const nameInputSchema = Schema.Struct({
  name: Schema.NullishOr(nameSchema).annotations({
    description: 'optional name to greet',
  }),
});

