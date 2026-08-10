import { defaultExclude, defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		watch: false,
		exclude: [
			...defaultExclude,
			'**/node_modules/**',
			'**/dist/**',
		],
	},
});
