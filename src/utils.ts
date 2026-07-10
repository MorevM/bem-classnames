import { kebabCase } from '@morev/utils';
import type { ModuleOptions } from './types';

// The shared `@morev/utils/isString` also handles boxed strings via Object#toString.
// This hot path only accepts primitive strings from the typed API, so `typeof` is enough.
export const isString = (value: unknown): value is string => typeof value === 'string';

/**
 * Creates a kebab-case converter with an internal cache scoped to the returned function.
 *
 * Repeated modifier names and values are normalized once, then read from the cache.
 *
 * @returns   Cached kebab-case converter.
 */
export const createCachedKebabCase = () => {
	const caseCache = new Map<string, string>();

	return (value: string) => {
		const cachedValue = caseCache.get(value);
		if (cachedValue !== undefined) return cachedValue;

		const casedValue = kebabCase(value);
		caseCache.set(value, casedValue);
		return casedValue;
	};
};

/**
 * Default module options.
 */
export const defaultOptions: ModuleOptions = {
	hyphenate: true,
	namespace: '',
	delimiters: {
		element: '__',
		modifier: '_',
		modifierValue: '_',
	},
};
