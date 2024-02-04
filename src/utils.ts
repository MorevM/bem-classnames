/* eslint-disable unicorn/prefer-ternary */
import { isObject, kebabCase } from '@morev/utils';
import type { _FunctionOptions, ModuleOptions } from './types';

export const defaultOptions: ModuleOptions = {
	hyphenate: true,
	namespace: '',
	delimiters: {
		element: '__',
		modifier: '_',
		modifierValue: '_',
	},
};

export const bemFunction = (
	{ namespace, block, element, modifiers, mixins }: _FunctionOptions,
	{ hyphenate, delimiters: ds }: ModuleOptions,
) => {
	if (!block) return '';

	const root = element
		? namespace + block + ds.element + element
		: namespace + block;

	let stackString = root;

	const doCase = (str: string) => (hyphenate ? kebabCase(str.toString()) : str.toString());

	if (isObject(modifiers)) {
		Object.entries(modifiers).forEach(([modKey, modValue]) => {
			if ([false, null, undefined].includes(modValue)) return;
			if (modValue === true) {
				stackString += ` ${root}${ds.modifier}${doCase(modKey)}`;
			} else {
				stackString += ` ${root}${ds.modifier}${doCase(modKey)}${ds.modifierValue}${doCase(modValue)}`;
			}
		});
	}

	mixins.length && (stackString += ` ${mixins.join(' ')}`);

	return stackString;
};
