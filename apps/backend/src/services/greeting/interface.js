/**
 * Greeting service contract.
 * @since 1.0.0
 */
import { Context } from 'effect';
/**
 * Service tag for greeting operations.
 * @since 1.0.0
 * @category Services
 */
export class GreetService extends Context.Tag('services/greeting')() {
}
