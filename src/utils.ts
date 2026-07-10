import type { ModuleOptions } from './types';

export const defaultOptions: ModuleOptions = {
	hyphenate: true,
	namespace: '',
	delimiters: {
		element: '__',
		modifier: '_',
		modifierValue: '_',
	},
};
