import babel from 'rollup-plugin-babel';

export default {
	input: 'src/index.js',
	output: [
		{ file: 'index.js', format: 'cjs', sourcemap: true, strict: false },
		{ file: 'index.mjs', format: 'esm', sourcemap: true, strict: false }
	],
	plugins: [
		babel({
			presets: [
				['@babel/env', {
					corejs: 3,
					loose: true,
					modules: false,
					targets: { node: 8 },
					useBuiltIns: 'entry'
				}]
			]
		})
	]
};
