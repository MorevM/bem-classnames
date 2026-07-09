import { isObject, isString } from '@morev/utils';
import { bemFunction, defaultOptions } from './utils';
import type { PlainObject } from '@morev/utils';
import type { _FunctionOptions, BlockFactory, ModuleOptions } from './types';

export type { BemFunction, BlockFactory, ModuleOptions } from './types';

/**
 * Returns a factory for creation classes in BEM notation with the specified settings. \
 * Allows to redefine module defaults.
 *
 * @param   userOptions   Module settings
 *
 * @returns
 */
export const bemClassnames = (userOptions?: Partial<ModuleOptions>): BlockFactory => {
	const options: Required<ModuleOptions> = {
		hyphenate: userOptions?.hyphenate ?? defaultOptions.hyphenate,
		namespace: userOptions?.namespace ?? defaultOptions.namespace,
		delimiters: {
			element: userOptions?.delimiters?.element ?? defaultOptions.delimiters.element,
			modifier: userOptions?.delimiters?.modifier ?? defaultOptions.delimiters.modifier,
			modifierValue: userOptions?.delimiters?.modifierValue ?? defaultOptions.delimiters.modifierValue,
		},
	};

	return (block: string) => (
		el?: string | PlainObject | null,
		...args: Array<string | PlainObject | null | undefined>
	) => {
		const result: _FunctionOptions = {
			block,
			namespace: options.namespace,
			element: '',
			modifiers: {},
			mixins: [],
		};

		isString(el) && (result.element = el);
		isObject(el) && (result.modifiers = el);

		args.forEach((arg) => {
			isString(arg) && arg.length && (result.mixins.push(arg));
			isObject(arg) && (result.modifiers = { ...result.modifiers, ...arg });
		});

		return bemFunction(result, options);
	};
};
