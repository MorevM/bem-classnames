import { isObject } from '@morev/utils';
import { createCachedKebabCase, defaultOptions, isString } from './utils';
import type { BemModifiers, BlockFactory, ModuleOptions } from './types';

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
	const { delimiters, hyphenate, namespace } = options;
	const doCase = hyphenate ? createCachedKebabCase() : (value: string) => value;

	return (block: string) => {
		if (!block) {
			throw new TypeError('Block name should be a non-empty string.');
		}

		const blockRoot = namespace + block;

		return (
			element?: string | BemModifiers | null,
			...args: Array<string | BemModifiers | null | undefined>
		) => {
			if (args.length === 0) {
				if (element === undefined || element === null || element === '') return blockRoot;
				if (isString(element)) return blockRoot + delimiters.element + element;
			}

			const root = isString(element) && element
				? blockRoot + delimiters.element + element
				: blockRoot;
			let modifiers = isObject(element) ? element : {};
			let mixins = '';

			args.forEach((arg) => {
				// Mixins are accumulated as a string to avoid an array allocation on every call.
				isString(arg) && arg.length && (mixins += mixins ? ` ${arg}` : arg);
				isObject(arg) && (modifiers = { ...modifiers, ...arg });
			});

			let stackString = root;

			// Modifiers are rendered before mixins regardless of the original argument order.
			Object.keys(modifiers).forEach((modKey) => {
				const modValue = modifiers[modKey];
				if (modValue === false || modValue === null || modValue === undefined) return;

				const modifier = `${root}${delimiters.modifier}${doCase(modKey)}`;
				stackString += modValue === true
					? ` ${modifier}`
					: ` ${modifier}${delimiters.modifierValue}${doCase(modValue.toString())}`;
			});

			return mixins ? `${stackString} ${mixins}` : stackString;
		};
	};
};

export type {
	BemFunction,
	BemModifiers,
	BlockFactory,
	ModifierValue,
	ModuleOptions,
} from './types';
