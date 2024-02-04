import type { PartialDeep } from '@morev/utils';
import { mergeObjects } from '@morev/utils';
import { describe, it, expect } from 'vitest';
import { bemClassnames } from '../src/index';
import { defaultOptions } from '../src/utils';

import type { ModuleOptions } from '../src/types';

const testOptionsFactory = (options: Partial<ModuleOptions>) => bemClassnames(options)('block');

const testCasesFactory = (block: CallableFunction, element: string | null, options: ModuleOptions) => {
	const ds = options.delimiters; // just shortcut
	const which = element ? `Element` : `Block`;
	const root = element ? `${options.namespace}block${ds.element}element` : `${options.namespace}block`;

	return [
		{
			name: which,
			result: block(element),
			expected: root,
		},
		{
			name: `${which} with mixin`,
			result: block(element, 'mixin'),
			expected: `${root} mixin`,
		},
		{
			name: `${which} with multiple mixins (joined)`,
			result: block(element, 'mixin another-mixin'),
			expected: `${root} mixin another-mixin`,
		},
		{
			name: `${which} with multiple mixins (separated)`,
			result: block(element, 'mixin', 'another-mixin'),
			expected: `${root} mixin another-mixin`,
		},
		{
			name: `${which} with camelCased boolean modifier`,
			result: block(element, { someParam: true }),
			expected: options.hyphenate
				? `${root} ${root}${ds.modifier}some-param`
				: `${root} ${root}${ds.modifier}someParam`,
		},
		{
			name: `${which} with PascalCased boolean modifier`,
			result: block(element, { SomeParam: true }),
			expected: options.hyphenate
				? `${root} ${root}${ds.modifier}some-param`
				: `${root} ${root}${ds.modifier}SomeParam`,
		},
		{
			name: `${which} boolean modifier, true case`,
			result: block(element, { active: true }),
			expected: `${root} ${root}${ds.modifier}active`,
		},
		{
			name: `${which} boolean modifier, false case`,
			result: block(element, { active: false }),
			expected: root,
		},
		{
			name: `${which} with multiple boolean modifiers, true case`,
			result: block(element, { active: true, dark: true }),
			expected: `${root} ${root}${ds.modifier}active ${root}${ds.modifier}dark`,
		},
		{
			name: `${which} with multiple boolean modifiers, false case`,
			result: block(element, { active: false, dark: false }),
			expected: root,
		},
		{
			name: `${which} with multiple boolean modifiers, mixed case`,
			result: block(element, { active: true, dark: false }),
			expected: `${root} ${root}${ds.modifier}active`,
		},
		{
			name: `${which} with multiple boolean modifiers and single mixin`,
			result: block(element, { active: true, dark: false }, 'static'),
			expected: `${root} ${root}${ds.modifier}active static`,
		},
		{
			name: `${which} with multiple boolean modifiers and multiple mixins`,
			result: block(element, 'mixin', { active: true, dark: false }, 'static'),
			expected: `${root} ${root}${ds.modifier}active mixin static`,
		},
		{
			name: `${which} with non-boolean modifier`,
			result: block(element, { theme: 'dark' }),
			expected: `${root} ${root}${ds.modifier}theme${ds.modifierValue}dark`,
		},
		{
			name: `${which} with non-boolean multiple modifiers`,
			result: block(element, { theme: 'dark', position: 'top' }),
			expected: `${root} ${root}${ds.modifier}theme${ds.modifierValue}dark ${root}${ds.modifier}position${ds.modifierValue}top`,
		},
		{
			name: `${which} with mixed modifiers`,
			result: block(element, { active: true, theme: 'dark' }),
			expected: `${root} ${root}${ds.modifier}active ${root}${ds.modifier}theme${ds.modifierValue}dark`,
		},
		{
			name: `${which} with mixed modifiers and mixin`,
			result: block(element, { active: true, theme: 'dark' }, 'mixin'),
			expected: `${root} ${root}${ds.modifier}active ${root}${ds.modifier}theme${ds.modifierValue}dark mixin`,
		},
	];
};

const testsFactory = (name: string, _options?: PartialDeep<ModuleOptions>) => {
	const options = mergeObjects(defaultOptions, _options ?? {}) as ModuleOptions;
	const block = testOptionsFactory(options);

	describe(name, () => {
		describe('Block', () => {
			const tests = testCasesFactory(block, null, options);

			tests.forEach(test => {
				it(test.name, () => expect(test.result).toBe(test.expected));
			});

			it('Block with modifiers as first parameter', () => {
				expect(block({ active: true })).toBe(`${options.namespace}block ${options.namespace}block${options.delimiters.modifier}active`);
			});
		});

		describe('Element', () => {
			const tests = testCasesFactory(block, 'element', options);

			tests.forEach(test => {
				it(test.name, () => expect(test.result).toBe(test.expected));
			});
		});
	});
};

describe('Edge cases', () => {
	it('Returns nothing if no block specified', () => {
		expect(bemClassnames()('')()).toBe('');
	});
});

// @ts-expect-error -- Intentionally pass smth weird
testsFactory('Default options', null);

testsFactory('Non-default element delimiter', {
	delimiters: {
		element: '-',
	},
});

testsFactory('Non-default modifier delimiter', {
	delimiters: {
		modifier: '_',
	},
});

testsFactory('Non-default modifier value delimiter', {
	delimiters: {
		modifierValue: '--',
	},
});

testsFactory('With namespace', {
	namespace: 'b-',
});


testsFactory('With namespace and custom delimiters', {
	namespace: 'b-',
	delimiters: {
		modifierValue: '--',
	},
});

testsFactory('With disabled hyphenation', {
	hyphenate: false,
});

// @ts-expect-error -- Intentionally pass smth weird
testsFactory('With unknown option', true);

testsFactory('With unknown options as object', {
	// @ts-expect-error -- Intentionally pass smth weird
	unknown: {
		some: 'value',
	},
});

testsFactory('All custom', {
	hyphenate: false,
	namespace: 'b-',
	delimiters: {
		element: '--',
		modifier: '---',
		modifierValue: '----',
	},
});
