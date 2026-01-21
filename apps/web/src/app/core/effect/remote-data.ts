export type RemoteData<E, A> =
	| {readonly _tag: 'Initial'}
	| {readonly _tag: 'Loading'}
	| {readonly _tag: 'Failure'; readonly error: E}
	| {readonly _tag: 'Success'; readonly value: A};

export const remoteData = {
  initial: <E, A>(): RemoteData<E, A> => ({ _tag: 'Initial' }),
  loading: <E, A>(): RemoteData<E, A> => ({ _tag: 'Loading' }),
  failure: <E, A>(error: E): RemoteData<E, A> => ({ _tag: 'Failure', error }),
  success: <E, A>(value: A): RemoteData<E, A> => ({ _tag: 'Success', value }),
} as const;
