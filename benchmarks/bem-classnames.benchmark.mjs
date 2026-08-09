/* eslint-disable no-console -- Benchmark CLI intentionally prints plain-text results. */
/* eslint-disable no-use-before-define -- Benchmark data stays above mechanics to make scenarios easier to scan. */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const distEsmUrl = new URL('../dist/index.js', import.meta.url);
const distCjsPath = fileURLToPath(new URL('../dist/index.cjs', import.meta.url));
const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const resultsDir = fileURLToPath(new URL('./results', import.meta.url));

const { bemClassnames } = await import(distEsmUrl.href);

const stableSamples = 5;
const stableIterations = 1_000_000;
const stableWarmupIterations = 100_000;
const variedSamples = 5;
const variedIterations = 1_000_000;
const variedWarmupIterations = 100_000;
const factorySamples = 5;
const factoryIterations = 500_000;
const factoryWarmupIterations = 50_000;
const coldStartSamples = 25;

const formatInteger = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const formatDecimal = new Intl.NumberFormat('en-US', {
	maximumFractionDigits: 2,
	minimumFractionDigits: 2,
});

const bem = bemClassnames();
const block = bem('block');
const button = bem('button');
const card = bem('card');
const noHyphenBlock = bemClassnames({ hyphenate: false })('block');
const customBlock = bemClassnames({
	namespace: 'b-',
	delimiters: {
		element: '-',
		modifier: '--',
		modifierValue: '-',
	},
})('block');

const stableScenarios = [
	{
		name: 'Block only',
		getValue: () => block(),
		expected: 'block',
	},
	{
		name: 'Element only',
		getValue: () => block('element'),
		expected: 'block__element',
	},
	{
		name: 'String mixins only',
		getValue: () => block(null, 'mixin', '', 'another-mixin', null),
		expected: 'block mixin another-mixin',
	},
	{
		name: 'Single boolean modifier',
		getValue: () => block({ active: true }),
		expected: 'block block_active',
	},
	{
		name: 'Mixed boolean modifiers',
		getValue: () => block({ active: true, disabled: false, isHighlighted: true }),
		expected: 'block block_active block_is-highlighted',
	},
	{
		name: 'Value modifiers',
		getValue: () => block({ theme: 'darkMode', size: 'extraLarge' }),
		expected: 'block block_theme_dark-mode block_size_extra-large',
	},
	{
		name: 'Element, modifiers, mixins',
		getValue: () => block('element', { theme: 'darkMode', size: 'extraLarge' }, 'mixin', '', 'another-mixin'),
		expected: 'block__element block__element_theme_dark-mode block__element_size_extra-large mixin another-mixin',
	},
	{
		name: 'Multiple modifier objects',
		getValue: () => block(null, { active: true, theme: 'dark' }, { theme: 'lightMode', position: 'top' }, 'mixin'),
		expected: 'block block_active block_theme_light-mode block_position_top mixin',
	},
	{
		name: 'No hyphenation',
		getValue: () => noHyphenBlock('element', { someParam: true, theme: 'darkMode' }, 'mixin', 'another-mixin'),
		expected: 'block__element block__element_someParam block__element_theme_darkMode mixin another-mixin',
	},
	{
		name: 'Namespace and custom delimiters',
		getValue: () => customBlock('element', { active: true, theme: 'darkMode' }, 'mixin'),
		expected: 'b-block-element b-block-element--active b-block-element--theme-dark-mode mixin',
	},
	{
		name: 'Ignored empty arguments',
		getValue: () => block(null, {}, null, undefined, ''),
		expected: 'block',
	},
];

const variedScenarios = [
	{
		name: 'Common UI calls',
		fixtures: [
			{
				name: 'block only',
				getValue: () => block(),
				expected: 'block',
			},
			{
				name: 'null element',
				getValue: () => block(null),
				expected: 'block',
			},
			{
				name: 'active block',
				getValue: () => block({ active: true }),
				expected: 'block block_active',
			},
			{
				name: 'disabled false',
				getValue: () => block({ disabled: false }),
				expected: 'block',
			},
			{
				name: 'string mixin',
				getValue: () => block(null, 'mixin'),
				expected: 'block mixin',
			},
			{
				name: 'button text element',
				getValue: () => button('text'),
				expected: 'button__text',
			},
			{
				name: 'card header mixin',
				getValue: () => card('header', 'layout__header'),
				expected: 'card__header layout__header',
			},
			{
				name: 'button icon size',
				getValue: () => button('icon', { size: 'extraSmall' }),
				expected: 'button__icon button__icon_size_extra-small',
			},
		],
	},
	{
		name: 'Modifier shapes',
		fixtures: [
			{
				name: 'single boolean',
				getValue: () => block({ active: true }),
				expected: 'block block_active',
			},
			{
				name: 'single value',
				getValue: () => block({ theme: 'darkMode' }),
				expected: 'block block_theme_dark-mode',
			},
			{
				name: 'mixed booleans',
				getValue: () => block({ active: true, disabled: false, selected: true }),
				expected: 'block block_active block_selected',
			},
			{
				name: 'three values',
				getValue: () => block({ theme: 'darkMode', size: 'extraLarge', position: 'topLeft' }),
				expected: 'block block_theme_dark-mode block_size_extra-large block_position_top-left',
			},
			{
				name: 'numeric modifier',
				getValue: () => card('item', { index: 2, featured: true }),
				expected: 'card__item card__item_index_2 card__item_featured',
			},
			{
				name: 'object as first argument',
				getValue: () => button({ active: true, type: 'primaryAction' }),
				expected: 'button button_active button_type_primary-action',
			},
			{
				name: 'merged objects',
				getValue: () => block(null, { active: true, theme: 'dark' }, { theme: 'lightMode', position: 'top' }),
				expected: 'block block_active block_theme_light-mode block_position_top',
			},
			{
				name: 'no hyphenation',
				getValue: () => noHyphenBlock({ someParam: true, theme: 'darkMode' }),
				expected: 'block block_someParam block_theme_darkMode',
			},
		],
	},
	{
		name: 'Full mixed calls',
		fixtures: [
			{
				name: 'element full',
				getValue: () => block('element', { active: true, theme: 'darkMode' }, 'mixin'),
				expected: 'block__element block__element_active block__element_theme_dark-mode mixin',
			},
			{
				name: 'block full',
				getValue: () => block(null, { active: true }, 'mixin', 'another-mixin'),
				expected: 'block block_active mixin another-mixin',
			},
			{
				name: 'custom delimiters',
				getValue: () => customBlock('element', { active: true, theme: 'darkMode' }, 'mixin'),
				expected: 'b-block-element b-block-element--active b-block-element--theme-dark-mode mixin',
			},
			{
				name: 'button direction',
				getValue: () => button('icon', { direction: 'leftToRight', size: 'extraSmall' }, 'icon'),
				expected: 'button__icon button__icon_direction_left-to-right button__icon_size_extra-small icon',
			},
			{
				name: 'card empty args',
				getValue: () => card(null, {}, null, undefined, ''),
				expected: 'card',
			},
			{
				name: 'overridden modifier with mixin',
				getValue: () => block(null, { active: true, theme: 'dark' }, { theme: 'lightMode' }, 'mixin'),
				expected: 'block block_active block_theme_light-mode mixin',
			},
			{
				name: 'no hyphen element',
				getValue: () => noHyphenBlock('element', { someParam: true, theme: 'darkMode' }, 'mixin'),
				expected: 'block__element block__element_someParam block__element_theme_darkMode mixin',
			},
		],
	},
];

const factoryScenarios = [
	{
		name: 'Create factory, default options',
		run: () => bemClassnames().length,
	},
	{
		name: 'Create factory, partial delimiters',
		run: () => bemClassnames({ delimiters: { modifier: '--' } }).length,
	},
	{
		name: 'Create factory, all options',
		run: () => bemClassnames({
			hyphenate: false,
			namespace: 'b-',
			delimiters: {
				element: '-',
				modifier: '--',
				modifierValue: '-',
			},
		}).length,
	},
	{
		name: 'Create block function',
		run: () => bem('block').length,
	},
];

const coldStartScenarios = [
	{
		name: 'Cold ESM import',
		args: [
			'--input-type=module',
			'--eval',
			`const startedAt = process.hrtime.bigint();
await import(${JSON.stringify(distEsmUrl.href)});
console.log(Number(process.hrtime.bigint() - startedAt) / 1e6);`,
		],
	},
	{
		name: 'Cold CJS require',
		args: [
			'--eval',
			`const startedAt = process.hrtime.bigint();
require(${JSON.stringify(distCjsPath)});
console.log(Number(process.hrtime.bigint() - startedAt) / 1e6);`,
		],
	},
];

const parseArguments = (args) => {
	const options = {
		comparePath: null,
		saveLabel: null,
		shouldPrintHelp: false,
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === '--') continue;

		if (arg === '--help' || arg === '-h') {
			options.shouldPrintHelp = true;
			continue;
		}

		if (arg === '--save') {
			const next = args[i + 1];
			options.saveLabel = next && !next.startsWith('--') ? next : 'snapshot';
			if (next && !next.startsWith('--')) i++;
			continue;
		}

		if (arg.startsWith('--save=')) {
			options.saveLabel = arg.slice('--save='.length) || 'snapshot';
			continue;
		}

		if (arg === '--compare') {
			const next = args[i + 1];
			if (!next || next.startsWith('--')) throw new Error('Expected a snapshot path after --compare.');
			options.comparePath = next;
			i++;
			continue;
		}

		if (arg.startsWith('--compare=')) {
			options.comparePath = arg.slice('--compare='.length);
			if (!options.comparePath) throw new Error('Expected a snapshot path after --compare=.');
			continue;
		}

		throw new Error(`Unknown benchmark argument: ${arg}`);
	}

	return options;
};

const printHelp = () => {
	console.log([
		'Usage:',
		'  pnpm run benchmark',
		'  pnpm run benchmark --save baseline',
		'  pnpm run benchmark --compare benchmarks/results/<snapshot>.json',
		'  pnpm run benchmark --compare benchmarks/results/<snapshot>.json --save after-change',
	].join('\n'));
};

const cliOptions = parseArguments(process.argv.slice(2));

const median = (values) => {
	const sorted = [...values].sort((a, b) => a - b);
	return sorted[Math.floor(sorted.length / 2)];
};

const measure = ({ run, samples, iterations, warmupIterations }) => {
	let checksum = 0;

	for (let i = 0; i < warmupIterations; i++) checksum += run();

	const timings = [];

	for (let sample = 0; sample < samples; sample++) {
		const startedAt = performance.now();

		for (let i = 0; i < iterations; i++) checksum += run();

		timings.push(performance.now() - startedAt);
	}

	const medianMs = median(timings);

	return {
		checksum,
		iterations,
		medianMs,
		minMs: Math.min(...timings),
		maxMs: Math.max(...timings),
		opsPerSecond: iterations / (medianMs / 1000),
		samples,
		warmupIterations,
	};
};

const measureStableScenarios = () => stableScenarios.map((scenario) => ({
	name: scenario.name,
	workloadSize: 1,
	...measure({
		run: () => scenario.getValue().length,
		samples: stableSamples,
		iterations: stableIterations,
		warmupIterations: stableWarmupIterations,
	}),
}));

const createVariedRun = (fixtures) => {
	let index = 0;

	return () => {
		const value = fixtures[index].getValue();
		index = (index + 1) % fixtures.length;
		return value.length;
	};
};

const measureVariedScenarios = () => variedScenarios.map((scenario) => ({
	fixtures: scenario.fixtures.map((fixture) => fixture.name),
	name: scenario.name,
	workloadSize: scenario.fixtures.length,
	...measure({
		run: createVariedRun(scenario.fixtures),
		samples: variedSamples,
		iterations: variedIterations,
		warmupIterations: variedWarmupIterations,
	}),
}));

const measureFactoryScenarios = () => factoryScenarios.map((scenario) => ({
	name: scenario.name,
	workloadSize: 1,
	...measure({
		run: scenario.run,
		samples: factorySamples,
		iterations: factoryIterations,
		warmupIterations: factoryWarmupIterations,
	}),
}));

const measureColdStart = ({ args }) => {
	const timings = [];

	for (let sample = 0; sample < coldStartSamples; sample++) {
		const result = spawnSync(process.execPath, args, {
			cwd: projectRoot,
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'pipe'],
		});

		if (result.status !== 0) {
			throw new Error(result.stderr.trim() || `Cold start benchmark failed with status ${result.status}`);
		}

		timings.push(Number(result.stdout.trim()));
	}

	return {
		iterations: coldStartSamples,
		medianMs: median(timings),
		minMs: Math.min(...timings),
		maxMs: Math.max(...timings),
		samples: coldStartSamples,
	};
};

const measureColdStartScenarios = () => coldStartScenarios.map((scenario) => ({
	name: scenario.name,
	workloadSize: 1,
	...measureColdStart(scenario),
}));

const pad = (value, width, align = 'start') => {
	const stringValue = String(value);
	return align === 'end' ? stringValue.padStart(width) : stringValue.padEnd(width);
};

const formatPercent = (value) => `${value > 0 ? '+' : ''}${formatDecimal.format(value)}%`;

const printRuntimeTable = (title, rows, { showWorkloadSize = false } = {}) => {
	console.log(`\n${title}`);
	console.log([
		pad('Scenario', 34),
		showWorkloadSize ? pad('fixtures', 8, 'end') : null,
		pad('ops/sec', 14, 'end'),
		pad('median ms', 12, 'end'),
		pad('min..max ms', 18, 'end'),
	].filter(Boolean).join('  '));

	for (const row of rows) {
		console.log([
			pad(row.name, 34),
			showWorkloadSize ? pad(row.workloadSize, 8, 'end') : null,
			pad(formatInteger.format(row.opsPerSecond), 14, 'end'),
			pad(formatDecimal.format(row.medianMs), 12, 'end'),
			pad(`${formatDecimal.format(row.minMs)}..${formatDecimal.format(row.maxMs)}`, 18, 'end'),
		].filter(Boolean).join('  '));
	}
};

const printColdStartTable = (rows) => {
	console.log(`\nCold start (${coldStartSamples} child processes, median import/require time only)`);
	console.log([
		pad('Scenario', 34),
		pad('median ms', 12, 'end'),
		pad('min..max ms', 18, 'end'),
	].join('  '));

	for (const row of rows) {
		console.log([
			pad(row.name, 34),
			pad(formatDecimal.format(row.medianMs), 12, 'end'),
			pad(`${formatDecimal.format(row.minMs)}..${formatDecimal.format(row.maxMs)}`, 18, 'end'),
		].join('  '));
	}
};

const printComparisonTable = (currentSnapshot, previousSnapshot) => {
	const previousRows = new Map(flattenSnapshotRows(previousSnapshot).map((row) => [row.key, row]));

	console.log(`\nComparison against ${previousSnapshot.label ?? 'snapshot'} (${previousSnapshot.createdAt ?? 'unknown date'})`);
	console.log([
		pad('Section', 12),
		pad('Scenario', 34),
		pad('before', 14, 'end'),
		pad('current', 14, 'end'),
		pad('delta', 10, 'end'),
	].join('  '));

	for (const currentRow of flattenSnapshotRows(currentSnapshot)) {
		const previousRow = previousRows.get(currentRow.key);
		if (!previousRow) continue;

		const delta = (currentRow.metric - previousRow.metric) / previousRow.metric * 100;
		const formatter = currentRow.metricName === 'ops/sec' ? formatInteger : formatDecimal;

		console.log([
			pad(currentRow.sectionLabel, 12),
			pad(currentRow.name, 34),
			pad(formatter.format(previousRow.metric), 14, 'end'),
			pad(formatter.format(currentRow.metric), 14, 'end'),
			pad(formatPercent(delta), 10, 'end'),
		].join('  '));
	}
};

const flattenSnapshotRows = (snapshot) => [
	...flattenSectionRows(snapshot, 'stable', 'stable', 'opsPerSecond', 'ops/sec'),
	...flattenSectionRows(snapshot, 'varied', 'varied', 'opsPerSecond', 'ops/sec'),
	...flattenSectionRows(snapshot, 'factory', 'factory', 'opsPerSecond', 'ops/sec'),
	...flattenSectionRows(snapshot, 'coldStart', 'cold start', 'medianMs', 'ms'),
];

const flattenSectionRows = (snapshot, sectionKey, sectionLabel, metricKey, metricName) => (
	(snapshot.sections?.[sectionKey] ?? []).map((row) => ({
		key: `${sectionKey}/${row.name}`,
		metric: row[metricKey],
		metricName,
		name: row.name,
		sectionLabel,
	}))
);

const validateStableScenarios = () => {
	for (const scenario of stableScenarios) {
		validateValue(scenario.name, scenario.getValue(), scenario.expected);
	}
};

const validateVariedScenarios = () => {
	for (const scenario of variedScenarios) {
		for (const fixture of scenario.fixtures) {
			validateValue(`${scenario.name} / ${fixture.name}`, fixture.getValue(), fixture.expected);
		}
	}
};

const validateValue = (name, actual, expected) => {
	if (actual === expected) return;

	throw new Error([
		`Unexpected result for "${name}".`,
		`Expected: ${JSON.stringify(expected)}`,
		`Actual:   ${JSON.stringify(actual)}`,
	].join('\n'));
};

const createSnapshot = ({ coldStartRows, factoryRows, stableRows, variedRows }) => ({
	createdAt: new Date().toISOString(),
	environment: {
		arch: process.arch,
		node: process.version,
		platform: process.platform,
		v8: process.versions.v8,
	},
	label: cliOptions.saveLabel,
	parameters: {
		coldStartSamples,
		factoryIterations,
		factorySamples,
		factoryWarmupIterations,
		stableIterations,
		stableSamples,
		stableWarmupIterations,
		variedIterations,
		variedSamples,
		variedWarmupIterations,
	},
	sections: {
		coldStart: coldStartRows,
		factory: factoryRows,
		stable: stableRows,
		varied: variedRows,
	},
});

const saveSnapshot = (snapshot) => {
	mkdirSync(resultsDir, { recursive: true });

	const slug = slugify(snapshot.label ?? 'snapshot');
	const timestamp = snapshot.createdAt.slice(0, 19).replaceAll(':', '-');
	const filePath = resolve(resultsDir, `${timestamp}-${slug}.json`);

	writeFileSync(filePath, `${JSON.stringify(snapshot, null, '\t')}\n`);
	return filePath;
};

const loadSnapshot = (inputPath) => {
	const filePath = isAbsolute(inputPath) ? inputPath : resolve(projectRoot, inputPath);
	return JSON.parse(readFileSync(filePath, 'utf8'));
};

const slugify = (value) => {
	const slug = value.toLowerCase().replaceAll(/[^\da-z]+/gi, '-').replaceAll(/^-|-$/g, '');
	return slug || 'snapshot';
};

if (cliOptions.shouldPrintHelp) {
	printHelp();
} else {
	validateStableScenarios();
	validateVariedScenarios();

	console.log('@morev/bem-classnames benchmark');
	console.log(`Node.js ${process.version}, ${process.platform}/${process.arch}`);
	console.log(`Stable samples: ${stableSamples}, iterations per sample: ${formatInteger.format(stableIterations)}`);
	console.log(`Varied samples: ${variedSamples}, iterations per sample: ${formatInteger.format(variedIterations)}`);

	const stableRows = measureStableScenarios();
	const variedRows = measureVariedScenarios();
	const factoryRows = measureFactoryScenarios();
	const coldStartRows = measureColdStartScenarios();

	const snapshot = createSnapshot({
		coldStartRows,
		factoryRows,
		stableRows,
		variedRows,
	});

	printRuntimeTable('Stable class name generation', stableRows);
	printRuntimeTable('Varied class name generation', variedRows, { showWorkloadSize: true });
	printRuntimeTable('Factory creation', factoryRows);
	printColdStartTable(coldStartRows);

	if (cliOptions.comparePath) {
		printComparisonTable(snapshot, loadSnapshot(cliOptions.comparePath));
	}

	if (cliOptions.saveLabel) {
		const filePath = saveSnapshot(snapshot);
		console.log(`\nSnapshot saved to ${filePath}`);
	}
}
