/**
 * Item repository service contract and live implementation.
 * @since 1.0.0
 */
import { Context } from 'effect';
/**
 * Service tag for the item repository.
 * @since 1.0.0
 * @category Services
 */
export class ItemRepoService extends Context.Tag('services/itemRepo')() {
}
