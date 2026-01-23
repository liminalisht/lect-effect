/**
 * Greeting service contract.
 * @since 1.0.0
 */
import { Context, type Effect, type Option } from 'effect';
import { type Name } from '@lect-effect/domain/hello/name';
import { type Greeting } from '@lect-effect/domain/hello/greeting';
declare const GreetService_base: Context.TagClass<GreetService, "services/greeting", Greet>;
/**
 * Service tag for greeting operations.
 * @since 1.0.0
 * @category Services
 */
export declare class GreetService extends GreetService_base {
}
/**
 * Interface for the greeting service implementation.
 * @since 1.0.0
 * @category Service Interfaces
 */
export type Greet = {
    readonly greet: (name: Option.Option<Name>) => Effect.Effect<Greeting>;
};
export {};
//# sourceMappingURL=interface.d.ts.map