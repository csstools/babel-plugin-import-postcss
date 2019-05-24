import requireFromCWD from './requireFromCWD';

// transform an sugary array of postcss plugins into a normal postcss plugin array
export default function mapSugaryPostCSSPlugins (plugin) {
	return typeof plugin === 'string'
		// "postcss-something"
		? requireFromCWD(plugin)
	: Array.isArray(plugin)
		? typeof plugin[0] === 'string'
			? plugin.length > 1
				// ["postcss-something", {}]
				? requireFromCWD(plugin[0])(plugin[1])
			// ["postcss-something"]
			: plugin[0]
		: plugin.length > 1
			// [postcssSomething, {}]
			? plugin[0](plugin[1])
		// [postcssSomething]
		: plugin[0]
	// postcssSomething
	: plugin
}
