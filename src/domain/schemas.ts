import { Arbitrary, Schema } from 'effect';

export type Name = Schema.Schema.Type<typeof nameSchema>;

export const nameSchema = Schema.String;

export const nameArbitrary = Arbitrary.make(nameSchema);

export type NameInput = Schema.Schema.Type<typeof nameInputSchema>;

export const nameInputSchema = Schema.Struct({
  name: Schema.NullishOr(nameSchema).annotations({
    description: 'Optional name to greet',
  }),
});

export const nameInputArbitrary = Arbitrary.make(nameInputSchema);

export type HelloResponse = Schema.Schema.Type<typeof helloResponseSchema>;

export const helloResponseSchema = Schema.Struct({
  greeting: Schema.String.annotations({
    description: 'Greeting message',
  }),
}).annotations({
  title: 'HelloResponse',
  description: 'Response payload for hello',
});

export const helloResponseArbitrary = Arbitrary.make(helloResponseSchema);

