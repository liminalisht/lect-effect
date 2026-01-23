/**
 * Hello handler providing a greeting based on optional name input.
 * @since 1.0.0
 */
import { Effect } from 'effect';
import { nameInputSchema, type NameInput } from '@lect-effect/domain/hello/nameInput';
import { helloResponseSchema, type HelloResponse } from '@lect-effect/domain/hello/helloResponse';
import { GreetService } from '../services/greeting/interface.js';
import { type QueryHandler } from './generic.js';
/**
 * Produces a greeting response using the greeting service.
 * @since 1.0.0
 * @category Hello Handler Effects
 */
export declare const helloHandler: (input: NameInput) => Effect.Effect<HelloResponse, never, GreetService>;
/**
 * Query handler for greeting users.
 * @since 1.0.0
 * @category Hello Handlers
 */
export declare const greetQuery: QueryHandler<typeof nameInputSchema, typeof helloResponseSchema, never, GreetService>;
/**
 * Registered hello handlers for GraphQL resolver conversion.
 * @since 1.0.0
 * @category Hello Handlers
 */
export declare const helloHandlers: QueryHandler<import("effect/Schema").Struct<{
    name: import("effect/Schema").NullishOr<import("effect/Schema").SchemaClass<string, string, never>>;
}>, import("effect/Schema").Struct<{
    greeting: import("effect/Schema").brand<typeof import("effect/Schema").String, "Greeting">;
}>, never, GreetService>[];
//# sourceMappingURL=hello.d.ts.map