export * from './name';
export * from './nameInput';
export * from './helloResponse';
export * from './greeting';

// import { Schema } from 'effect';

// export type Name = Schema.Schema.Type<typeof nameSchema>;

// export const nameSchema = Schema.String;

// // // todo: move or remove
// // export const nameArbitrary = Arbitrary.make(nameSchema);

// export type NameInput = Schema.Schema.Type<typeof nameInputSchema>;

// export const nameInputSchema = Schema.Struct({
//   name: Schema.NullishOr(nameSchema).annotations({
//     description: 'optional name to greet',
//   }),
// });

// // // todo: move or remove
// // export const nameInputArbitrary = Arbitrary.make(nameInputSchema);

// export type HelloResponse = Schema.Schema.Type<typeof helloResponseSchema>;

// export const helloResponseSchema = Schema.Struct({
//   greeting: Schema.String.annotations({
//     description: 'greeting message',
//   }),
// }).annotations({
//   title: 'HelloResponse',
//   description: 'response for hello',
// });

// export type Greeting = Schema.Schema.Type<typeof greetingSchema>;

// export const greetingSchema = Schema.String.pipe(Schema.brand('Greeting'));
