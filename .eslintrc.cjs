module.exports = {
	root: true,
	extends: [
		'@morev/eslint-config/base',
		'@morev/eslint-config/preset/assistive',
		'@morev/eslint-config/preset/typescript',
	],
	overrides: [
		{ files: '*.cjs', extends: ['@morev/eslint-config/node'] },
	],
	rules: {},
};
