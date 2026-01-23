/**
 * Minimal JSON value shape for GraphQL responses.
 * @since 1.0.0
 */

/**
 * Minimal JSON value shape for GraphQL responses.
 * @since 1.0.0
 * @category Types
 */
export type Json =
	| null
	| boolean
	| number
	| string
	| readonly Json[]
	| {[key: string]: Json};
