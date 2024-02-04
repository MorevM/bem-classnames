import type { PlainObject } from '@morev/utils';
import { isString, isObject, mergeObjects } from '@morev/utils';
import type { _FunctionOptions, BlockFactory, ModuleOptions } from './types';
import { defaultOptions, bemFunction } from './utils';

/**
 * Returns a factory for creation classes in BEM notation with the specified settings. \
 * Allows to redefine module defaults.
 *
 * @param   userOptions   Module settings
 *
 * @returns
 */
export const bemClassnames = (userOptions?: Partial<ModuleOptions>): BlockFactory => {
	const options = mergeObjects(defaultOptions, userOptions ?? {}) as Required<ModuleOptions>;

	return (block: string) => (el?: string | PlainObject | null, ...args: Array<string | PlainObject>) => {
		const result: _FunctionOptions = {
			block,
			namespace: options.namespace,
			element: '',
			modifiers: {},
			mixins: [],
		};

		isString(el) && (result.element = el);
		isObject(el) && (result.modifiers = el);

		args.forEach(arg => {
			isString(arg) && (result.mixins.push(arg));
			isObject(arg) && (result.modifiers = { ...result.modifiers, ...arg });
		});

		return bemFunction(result, options);
	};
};
