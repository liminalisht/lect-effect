import {defineConfig} from 'astro/config';
import mermaid from 'astro-mermaid';
import starlight from '@astrojs/starlight';
import gruvbox from 'starlight-theme-gruvbox';

export default defineConfig({
  integrations: [
    mermaid({
      autoTheme: true,
    }), // ⚠️ Must come BEFORE starlight, per https://github.com/joesaby/astro-mermaid
    starlight({
      plugins: [gruvbox()],
      title: 'lect-effect',
      favicon: './src/assets/monad.svg',
      social: [{icon: 'github', label: 'GitHub', href: 'https://github.com/liminalisht/lect-effect'}],
      sidebar: [
        {
          label: 'Introduction to lect-effect',
          autogenerate: {directory: 'guides'},
          collapsed: true,
        },
        {
          label: '@lect-effect/backend',
          collapsed: true,
          items: [
            {label: 'Overview', link: '/backend'},
            {label: 'API', autogenerate: {directory: 'backend/modules'}},
          ],
        },
        {
          label: '@lect-effect/cli',
          collapsed: true,
          items: [
            {label: 'Overview', link: '/cli'},
            {label: 'API', autogenerate: {directory: 'cli/modules'}, collapsed: true},
          ],
        },
        {
          label: '@lect-effect/docs',
          collapsed: true,
          items: [{label: 'Overview', link: '/docs'}],
        },
        {
          label: '@lect-effect/domain',
          collapsed: true,
          items: [
            {label: 'Overview', link: '/domain'},
            {label: 'API', autogenerate: {directory: 'domain/modules'}, collapsed: true},
          ],
        },
        {
          label: '@lect-effect/frontend',
          collapsed: true,
          items: [
            {label: 'Overview', link: '/frontend'},
            {label: 'API', autogenerate: {directory: 'frontend/modules'}, collapsed: true},
          ],
        },
        {
          label: '@lect-effect/graphql-schema',
          collapsed: true,
          items: [
            {label: 'Overview', link: '/graphql-schema'},
            {label: 'API', autogenerate: {directory: 'graphql-schema/modules'}, collapsed: true},
          ],
        },
        {
          label: '@lect-effect/handlers',
          collapsed: true,
          items: [
            {label: 'Overview', link: '/handlers'},
            {label: 'API', autogenerate: {directory: 'handlers/modules'}, collapsed: true},
          ],
        },
        {
          label: '@lect-effect/migrations',
          collapsed: true,
          items: [{label: 'Overview', link: '/migrations'}],
        },
        {
          label: '@lect-effect/services',
          collapsed: true,
          items: [
            {label: 'Overview', link: '/services'},
            {label: 'API', autogenerate: {directory: 'services/modules'}, collapsed: true},
          ],
        },
      ],
    }),
  ],
});
