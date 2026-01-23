/**
 * Remote data discriminated union for UI loading states.
 * @since 1.0.0
 */

/**
 * Remote data helpers for representing async UI states.
 * @since 1.0.0
 * @category Types
 */
export type RemoteData<E, A> =
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
  initial: <E, A>(): RemoteData<E, A> => ({ _tag: 'Initial' }),
  loading: <E, A>(): RemoteData<E, A> => ({ _tag: 'Loading' }),
  failure: <E, A>(error: E): RemoteData<E, A> => ({ _tag: 'Failure', error }),
  success: <E, A>(value: A): RemoteData<E, A> => ({ _tag: 'Success', value }),
} as const;
