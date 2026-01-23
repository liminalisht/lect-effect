/**
 * Aggregate union of GraphQL errors.
 * @since 1.0.0
 * @category GraphQL Errors
 */
export type GraphqlError = ServerStartError | RuntimeMissingFromContextError;
declare const ServerStartError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "ServerStartError";
} & Readonly<A>;
/**
 * Error raised when the server fails to start.
 * @since 1.0.0
 * @category GraphQL Errors
 */
export declare class ServerStartError extends ServerStartError_base<ServerStartErrorShape> {
}
type ServerStartErrorShape = {
    error: unknown;
};
declare const RuntimeMissingFromContextError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "RuntimeMissingFromContextError";
} & Readonly<A>;
/**
 * Error raised when GraphQLContext lacks the Effect runtime.
 * @since 1.0.0
 * @category GraphQL Errors
 */
export declare class RuntimeMissingFromContextError extends RuntimeMissingFromContextError_base<RuntimeMissingFromContextErrorShape> {
}
type RuntimeMissingFromContextErrorShape = {
    readonly message?: string;
};
export {};
//# sourceMappingURL=errors.d.ts.map