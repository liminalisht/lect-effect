import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  // Starlight loader currently types as `any`; suppress unsafe lint until upstream types improve.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
