import { Arbitrary, Schema } from 'effect';

export const NameSchema = Schema.String;
export type Name = Schema.Schema.Type<typeof NameSchema>;
export const NameArbitrary = Arbitrary.make(NameSchema);

export const NameInputSchema = Schema.Struct({
  name: Schema.NullishOr(NameSchema).annotations({
    description: 'Optional name to greet',
  }),
});
export type NameInput = Schema.Schema.Type<typeof NameInputSchema>;
export const NameInputArbitrary = Arbitrary.make(NameInputSchema);
export const NameInputStandard = Schema.standardSchemaV1(NameInputSchema);

export const HelloResponseSchema = Schema.Struct({
  greeting: Schema.String.annotations({
    description: 'Greeting message',
  }),
}).annotations({
  title: 'HelloResponse',
  description: 'Response payload for hello',
});
export type HelloResponse = Schema.Schema.Type<typeof HelloResponseSchema>;
export const HelloResponseArbitrary = Arbitrary.make(HelloResponseSchema);
export const HelloResponseStandard = Schema.standardSchemaV1(HelloResponseSchema);

