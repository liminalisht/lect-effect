/**
 * Application service union definition.
 * @since 0.1.0
 */
import { type AppConfigService } from '../appConfig/interface/index.js';
import { type GreetService } from '../greeting/interface.js';
import { type ItemRepoService } from '../itemRepo/interface.js';
import { type MasterdataDbService } from '../masterdataDb/interface.js';
import { type ProductRepoService } from '../productRepo/interface.js';

/**
 * Union of all services the app provides.
 * @since 0.1.0
 * @category Application Services
 */
export type AppServices =
	AppConfigService
	| GreetService
	| MasterdataDbService
	| ItemRepoService
	| ProductRepoService;
