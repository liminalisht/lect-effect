/**
 * Minimal JSON value shape for GraphQL responses.
 * @since 0.1.0
 */

/**
 * Minimal JSON value shape for GraphQL responses.
 * @since 0.1.0
 * @category Types
 */
export type Json =
	| null
	| boolean
	| number
	| string
	| readonly Json[]
	| {[key: string]: Json};
