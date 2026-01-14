// @ts-check
import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';
import gruvbox from "starlight-theme-gruvbox";

// See https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
      plugins: [
        gruvbox()
      ],
			title: 'lect-effect',
			social: [{icon: 'github', label: 'GitHub', href: 'https://github.com/liminalisht/lect-effect'}],
			sidebar: [
				{
					label: 'guides',
					autogenerate: {directory: 'guides'},
				},
				{
					label: 'reference',
					autogenerate: {directory: 'src/modules'},
				},
			],
		}),
	],
});
