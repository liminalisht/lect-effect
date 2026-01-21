// @ts-check
import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';
import gruvbox from 'starlight-theme-gruvbox';

// See https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			plugins: [
				gruvbox(),
			],
			title: 'lect-effect',
			social: [{icon: 'github', label: 'GitHub', href: 'https://github.com/liminalisht/lect-effect'}],
			sidebar: [
				{
					label: 'guides',
					autogenerate: {directory: 'guides'},
				},
				{
					label: 'domain',
					autogenerate: {directory: 'domain/modules', collapsed: true},
				},
				{
					label: 'backend',
					autogenerate: {directory: 'backend/modules', collapsed: true},
				},

				{
					label: 'frontend',
					autogenerate: {directory: 'frontend/modules', collapsed: true},
				},
			],
		}),
	],
});
