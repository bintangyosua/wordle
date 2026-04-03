import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: false
	},
	kit: {
		adapter: adapter(),
		alias: {
			$components: 'src/components',
			$constants: 'src/constants'
		}
	}
};

export default config;
