import { Schema } from 'effect';

export type ItemDescription = Schema.Schema.Type<typeof itemDescriptionSchema>;

export const itemDescriptionSchema = Schema.NullOr(Schema.String).annotations({
  description: 'item description (nullable)',
});

