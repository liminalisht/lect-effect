import { type ConfigService } from './config';
import { type GreetingService } from './greeting';
import { type MasterdataDb } from './masterdataDb';

export { ConfigService } from './config';
export { GreetingService } from './greeting';

export type AppServices = ConfigService | GreetingService | MasterdataDb;
