import { defineConfig } from 'tsdown';

export default defineConfig({
	sourcemap: false,
	clean: true,
	target: 'esnext',
	format: ['cjs', 'esm'],
	dts: true,
	entry: ['src/index.ts'],
	outExtensions: ({ format }) => ({ js: format === 'cjs' ? `.${format}` : `.js` }),
});
