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
					label: 'Introduction to lect-effect',
					autogenerate: {directory: 'guides', collapsed: true},
				},
				{
					label: '@lect-effect/backend',
					autogenerate: {directory: 'backend', collapsed: true},
				},
				{
					label: '@lect-effect/domain',
					autogenerate: {directory: 'domain', collapsed: true},
				},
				{
					label: '@lect-effect/frontend',
					autogenerate: {directory: 'frontend', collapsed: true},
				},
			],
		}),
	],
});
