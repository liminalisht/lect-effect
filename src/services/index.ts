import { type ConfigService } from './config';
import { type GreetingService } from './greeting';

export { ConfigService, type Port, makePort } from './config';
export { GreetingService } from './greeting';

export type AppServices = ConfigService | GreetingService;
