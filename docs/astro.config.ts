import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';
import gruvbox from 'starlight-theme-gruvbox';

export default defineConfig({
  integrations: [
    starlight({
      plugins: [gruvbox()],
      title: 'lect-effect',
      social: [{icon: 'github', label: 'GitHub', href: 'https://github.com/liminalisht/lect-effect'}],
      sidebar: [
        {
          label: 'Introduction to lect-effect',
          autogenerate: {directory: 'guides', collapsed: true},
        },
        {
          label: '@lect-effect/backend',
          items: [
            {label: 'Overview', link: '/backend'},
            {label: 'API', autogenerate: {directory: 'backend/modules', collapsed: true}},
          ],
        },
        {
          label: '@lect-effect/cli',
          items: [
            {label: 'Overview', link: '/cli'},
            {label: 'API', autogenerate: {directory: 'cli/modules', collapsed: true}},
          ],
        },
        {
          label: '@lect-effect/domain',
          items: [
            {label: 'Overview', link: '/domain'},
            {label: 'API', autogenerate: {directory: 'domain/modules', collapsed: true}},
          ],
        },
        {
          label: '@lect-effect/frontend',
          items: [
            {label: 'Overview', link: '/frontend'},
            {label: 'API', autogenerate: {directory: 'frontend/modules', collapsed: true}},
          ],
        },
        {
          label: '@lect-effect/graphql-schema',
          items: [
            {label: 'Overview', link: '/graphql-schema'},
            {label: 'API', autogenerate: {directory: 'graphql-schema/modules', collapsed: true}},
          ],
        },
        {
          label: '@lect-effect/handlers',
          items: [
            {label: 'Overview', link: '/handlers'},
            {label: 'API', autogenerate: {directory: 'handlers/modules', collapsed: true}},
          ],
        },
        {
          label: '@lect-effect/services',
          items: [
            {label: 'Overview', link: '/services'},
            {label: 'API', autogenerate: {directory: 'services/modules', collapsed: true}},
          ],
        },
        {
          label: '@lect-effect/migrations',
          items: [{label: 'Overview', link: '/migrations'}],
        },
        {
          label: '@lect-effect/docs site',
          items: [{label: 'Overview', link: '/docs'}],
        },
      ],
    }),
  ],
});
