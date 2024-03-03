/* eslint-disable @typescript-eslint/prefer-function-type -- Using `type` export TSC loses JSDocs */
import type { PlainObject } from '@morev/utils';

export type ModuleOptions = {
	/**
	 * If `true`, then the modifier names and their values will be converted to kebab-case. \
	 * If `false`, both renders as passed.
	 *
	 * @example
	 * // `true` case
	 * const b = bemClassNames({ hyphenate: true })('block');
	 * b(null, { someModifierName: true }) // => block_some-modifier-name
	 * b(null, { someModifier: 'longValue' }) // => block_some-modifier_some-value
	 *
	 * // `false` case
	 * const b = bemClassNames({ hyphenate: false })('block');
	 * b(null, { someModifierName: true }) // => block--someModifierName
	 * b('el', { someModifier: 'longValue' }) // => block__el_someModifier-longValue
	 *
	 * @default true
	 */
	hyphenate: boolean;

	/**
	 * If passed, it renders in front of the block name.
	 *
	 * @example
	 * const b = bemClassNames({ namespace: 'b-' })('block');
	 * b(null) // => b-block
	 * b('element') // => b-block__element
	 *
	 * @default ''
	 */
	namespace: string;

	/**
	 * Allows to customize delimiters between significant parts of the BEM declaration (element, modifier, modifier value).
	 */
	delimiters: {
		/**
		 * Delimiter between `block` and `element`. \
		 * This one not recommended to change.
		 *
		 * @default '__'
		 */
		element: string;

		/**
		 * Delimiter between `element` and `modifier`. \
		 * Many people prefer change it to `--` to increase readability.
		 *
		 * @default '_'
		 */
		modifier: string;

		/**
		 * Delimiter between `modifier name` and `modifier value` (if needed).
		 *
		 * @default '_'
		 */
		modifierValue: string;
	};
};

/**
 * Converts passed strings/objects into a valid class name.
 *
 * @example
 *   const b = bemClassNames()('block');
 *   b(null); b(); // => 'block'
 *   b(null, { modifier: true }); => 'block_modifier'
 *   b('element'); // => 'block__element'
 * @example
 *   const b = bemClassNames()('block');
 *   b(null, 'mixin'); // => 'block mixin'
 *   b(null, { modifier: true }); => 'block_modifier'
 *   b('element', { active: true }, 'static'); // => 'block__element block__element--active static'
 *
 * @param   el     The name of the element, can be omitted (or `null`) if you need to interact with the modifiers and mixins of the block itself.
 * @param   args   List of mixins (if passed string) and modifiers (if passed object).
 *
 * @returns        A valid class name according to the BEM methodology.
 */
export interface BemFunction {
	/**
	 * Converts passed strings/objects into a valid class name.
	 *
	 * @example
	 *   const b = bemClassNames()('block');
	 *   b(null); b(); // => 'block'
	 *   b(null, { modifier: true }); => 'block_modifier'
	 *   b('element'); // => 'block__element'
	 * @example
	 *   const b = bemClassNames()('block');
	 *   b(null, 'mixin'); // => 'block mixin'
	 *   b(null, { modifier: true }); => 'block_modifier'
	 *   b('element', { active: true }, 'static'); // => 'block__element block__element--active static'
	 *
	 * @param   el     The name of the element, can be omitted (or `null`) if you need to interact with the modifiers and mixins of the block itself.
	 * @param   args   List of mixins (if passed string) and modifiers (if passed object).
	 *
	 * @returns        A valid class name according to the BEM methodology.
	 */
	(el?: string | PlainObject | null, ...args: Array<string | PlainObject>): string;
}

/**
 * Returns a factory for creation BEM class names for specified block name.
 *
 * @example
 *   const blockFactory = bemClassNames();
 *   blockFactory('block')(); // => 'block'
 *
 *   const namespacedBlockFactory = bemClassNames({namespace: 'b-'});
 *   namespacedBlockFactory('block')(); // => 'b-block'
 *
 * @param   block   The block name. \
 *                  It's recommended to use it every time when you need BEM entities with different options (such as `namespace`).
 */
export interface BlockFactory {
	/**
	 * Returns a factory for creation BEM class names for specified block name.
	 *
	 * @example
	 *   const blockFactory = bemClassNames();
	 *   blockFactory('block')(); // => 'block'
	 *
	 *   const namespacedBlockFactory = bemClassNames({namespace: 'b-'});
	 *   namespacedBlockFactory('block')(); // => 'b-block'
	 *
	 * @param   block   The block name. \
	 *                  It's recommended to use it every time when you need BEM entities with different options (such as `namespace`).
	 */
	(block: string): BemFunction;
}

export type _FunctionOptions = {
	block: string;
	namespace: string;
	element: string;
	modifiers: object;
	mixins: string[];
};
