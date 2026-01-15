import { type Effect, type Schema } from 'effect';

export type FieldHandler<
  P extends Schema.Schema.AnyNoContext,
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext,
  E,
  R,
> = {
    kind: 'field';
    parentSchema: P;
    key: string;
    descriptionString: string;
    inputSchema: I;
    outputSchema: O;
    handler: (parent: Schema.Schema.Type<P>, input: Schema.Schema.Type<I>) => Effect.Effect<Schema.Schema.Type<O>, E, R>;
};

export type QueryHandler<
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext,
  E,
  R,
> = {
    kind: 'query';
    key: string;
    descriptionString: string;
    inputSchema: I;
    outputSchema: O;
    handler: (input: Schema.Schema.Type<I>) => Effect.Effect<Schema.Schema.Type<O>, E, R>;
};

export type MutationHandler<
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext,
  E,
  R,
> = {
    kind: 'mutation';
    key: string;
    descriptionString: string;
    inputSchema: I;
    outputSchema: O;
    handler: (input: Schema.Schema.Type<I>) => Effect.Effect<Schema.Schema.Type<O>, E, R>;
};
