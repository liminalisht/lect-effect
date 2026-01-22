/**
 * Schema-governed form field helpers built on Angular signals.
 */
import {computed, signal, type Signal, type WritableSignal} from '@angular/core';
import {Either, Schema} from 'effect';
import {type ParseError} from 'effect/ParseResult';

type ToUnknown<Raw> = (raw: Raw) => unknown;

type SchemaFieldOptions<Raw, A> = {
  readonly schema: Schema.Schema<A>;
  readonly initialRaw: Raw;
  readonly toUnknown?: ToUnknown<Raw>;
};

export type SchemaField<Raw, A> = {
  readonly raw: WritableSignal<Raw>;
  readonly parsed: Signal<Either.Either<A, ParseError>>;
  readonly value: Signal<A | null>;
  readonly error: Signal<ParseError | null>;
  readonly isValid: Signal<boolean>;
  readonly setRaw: (raw: Raw) => void;
};

const decodeEither = <A>(schema: Schema.Schema<A>) =>
  Schema.decodeUnknownEither(schema);

export const schemaField = <Raw, A>(options: SchemaFieldOptions<Raw, A>): SchemaField<Raw, A> => {
  const {schema, initialRaw, toUnknown} = options;
  const toUnknownFn: ToUnknown<Raw> = toUnknown ?? (value => value as unknown);
  const decode = decodeEither(schema);

  const raw = signal(initialRaw);
  const parsed = computed(() => decode(toUnknownFn(raw())));
  const value = computed(() => {
    const result = parsed();
    return Either.isRight(result) ? result.right : null;
  });
  const error = computed(() => {
    const result = parsed();
    return Either.isLeft(result) ? result.left : null;
  });
  const isValid = computed(() => Either.isRight(parsed()));
  const setRaw = (next: Raw) => {
    raw.set(next);
  };

  return {
    raw,
    parsed,
    value,
    error,
    isValid,
    setRaw,
  };
};

export const stringToNullIfBlank = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

export const stringToInt = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
};
