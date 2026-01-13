import { type ConfigService } from './config';
import { type GreetingService } from './greeting';
import { type ItemRepo } from './itemRepo';
import { type MasterdataDb } from './masterdataDb';
import { type ProductRepo } from './productRepo';

export type AppServices =
	ConfigService
	| GreetingService
	| MasterdataDb
	| ProductRepo
	| ItemRepo;
