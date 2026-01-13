/**
 * Input shape for greeting by name.
 * @since 1.0.0
 */
import { Schema } from 'effect';
import { nameSchema } from './name';

/**
 * Input payload for greeting by name.
 * @since 1.0.0
 */
export type NameInput = Schema.Schema.Type<typeof nameInputSchema>;

/**
 * Schema for the optional greeting name input.
 * @since 1.0.0
 */
export const nameInputSchema = Schema.Struct({
  name: Schema.NullishOr(nameSchema).annotations({
    description: 'optional name to greet',
  }),
});

