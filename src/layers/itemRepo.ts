import { Layer } from 'effect';
import { ItemRepo, ItemRepoLive } from '../services/itemRepo';

export const itemRepoLayer = Layer.effect(ItemRepo, ItemRepoLive);
