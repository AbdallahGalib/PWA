import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			fallback: '200.html'
		}),
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// Ignore missing files during prerender
				if (path === '/favicon.ico' || path === '/manifest.json' || path.startsWith('/images/')) {
					return;
				}
				
				// otherwise fail the build
				throw new Error(message);
			}
		}
	},
	preprocess: vitePreprocess()
};

export default config;
