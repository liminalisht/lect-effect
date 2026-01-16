/**
 * Application service union definition.
 * @since 1.0.0
 */
import { type ConfigService } from '../config/interface';
import { type GreetingService } from '../greeting/interface';
import { type ItemRepoService } from '../itemRepo/interface';
import { type MasterdataDbService } from '../masterdataDb/interface';
import { type ProductRepoService } from '../productRepo/interface';

/**
 * Union of all services the app provides.
 * @since 1.0.0
 */
export type AppServices =
	ConfigService
	| GreetingService
	| MasterdataDbService
	| ProductRepoService
	| ItemRepoService;
