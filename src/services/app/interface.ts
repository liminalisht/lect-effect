/**
 * Application service union definition.
 * @since 1.0.0
 */
import { type ConfigService } from '../config/interface';
import { type GreetingService } from '../greeting/interface';
import { type ItemRepo } from '../itemRepo/interface';
import { type MasterdataDb } from '../masterdataDb/interface';
import { type ProductRepo } from '../productRepo/interface';

/**
 * Union of all services the app provides.
 * @since 1.0.0
 */
export type AppServices =
	ConfigService
	| GreetingService
	| MasterdataDb
	| ProductRepo
	| ItemRepo;
