/**
 * Application service union definition.
 * @since 1.0.0
 */
import { type ConfigService } from './config';
import { type GreetingService } from './greeting';
import { type ItemRepo } from './itemRepo';
import { type MasterdataDb } from './masterdataDb';
import { type ProductRepo } from './productRepo';

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
