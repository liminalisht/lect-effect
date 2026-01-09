import { type ConfigService } from './config';
import { type GreetingService } from './greeting';

export { ConfigService } from './config';
export { GreetingService } from './greeting';

export type AppServices = ConfigService | GreetingService;
