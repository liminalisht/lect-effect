/**
 * Remote data discriminated union for UI loading states.
 * @since 1.0.0
 */

/**
 * Remote data helpers for representing async UI states.
 * @since 1.0.0
 * @category Types
 */
export type RemoteData<A, E> =
	| {readonly _tag: 'Initial'}
	| {readonly _tag: 'Loading'}
	| {readonly _tag: 'Failure'; readonly error: E}
	| {readonly _tag: 'Success'; readonly value: A};

/**
 * Helpers to construct remote data values.
 * @since 1.0.0
 * @category Constructors
 */
export const remoteData = {
  initial: <A, E>(): RemoteData<A, E> => ({ _tag: 'Initial' }),
  loading: <A, E>(): RemoteData<A, E> => ({ _tag: 'Loading' }),
  failure: <A, E>(error: E): RemoteData<A, E> => ({ _tag: 'Failure', error }),
  success: <A, E>(value: A): RemoteData<A, E> => ({ _tag: 'Success', value }),
} as const;
