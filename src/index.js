import cosmicconfig from 'cosmiconfig';
import deasync from 'deasync';
import fs from 'fs';
import path from 'path';
import postcss from 'postcss';

export default function babelPluginImportPostCSS(api, rawopts) {
	// options from postcss configuration files overridden by local options
	const opts = loadOptions(rawopts);

	// determine the PostCSS plugins used to process CSS
	const plugins = [].concat(opts.plugins || []).map(mapSugaryPostCSSPlugins);

	// determine how errors should be handled
	const severity = 'severity' in opts ? String(opts.severity).toLowerCase() : 'throw';

	// determine which file extensions should be transformed
	const extensions = [].concat('extensions' in opts ? opts.extensions : /\.[^.]*css/);

	// additional options as passed into PostCSS as process options
	const initialProcessOpts = getInitialProcessOptsFromOpts(opts);

	// takes a pathname and returns processed css
	const getPostCSSFromPathname = getPostCSSFromPathnameGenerator(plugins, initialProcessOpts, severity);

	return {
		visitor: {
			ImportDeclaration: {
				exit(nodePath, state) {
					// the absolute path relative to the current file
					const pathname = path.resolve(path.dirname(state.file.opts.filename), nodePath.node.source.value);

					// the name of the variable being assigned css
					const defaultImportName = getDefaultImportNameFromNodePath(nodePath);

					// whether the pathname includes a file extension to be transformed
					const pathnameIncludesExtensions = doesPathnameIncludeExtensions(pathname, extensions);

					if (defaultImportName && pathnameIncludesExtensions) {
						const css = getPostCSSFromPathname(pathname);

						// replace the import statement with a variable being assigned the css as a string
						nodePath.replaceWith(api.types.variableDeclaration('var', [
							api.types.variableDeclarator(api.types.identifier(defaultImportName), api.types.stringLiteral(css))
						]));
					}
				}
			}
		}
	};
}

// load options from a postcss configuration file overridden by local options
function loadOptions(opts) {
	let awaitedResult;

	cosmicconfig('postcss').search().then(result => {
		awaitedResult = Object.assign(Object(Object(result).config), opts);
	});

	deasync.loopWhile(() => awaitedResult === undefined);

	return awaitedResult;
}

// transform an sugary array of postcss plugins into a normal postcss plugin array
function mapSugaryPostCSSPlugins(plugin) {
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

// require a module or file in relationship to the current working directory
function requireFromCWD(id) {
	return require(require.resolve(id, { paths: [process.cwd()] }));
}

// remove plugin specific options and return the remaining process options
function getInitialProcessOptsFromOpts(opts) {
	const initialProcessOpts = Object.assign({}, opts);

	delete initialProcessOpts.extensions;
	delete initialProcessOpts.severity;
	delete initialProcessOpts.plugins;

	return initialProcessOpts;
}

// a synchronous function that processes css
function getPostCSSFromPathnameGenerator(plugins, initialProcessOpts, severity) {
	const fallbackCSS = '';

	let processor;

	return from => {
		processor = processor || postcss(plugins);

		try {
			const source = fs.readFileSync(from, 'utf8');

			let awaitedCSS;

			const processOpts = Object.assign({ from }, initialProcessOpts);

			processor.process(source, processOpts).catch(error => {
				if (severity === 'warn') {
					console.warn(error.message);
				} else if (severity !== 'ignore') {
					throw error;
				}

				return fallbackCSS;
			}).then(result => {
				awaitedCSS = result.css;
			});

			deasync.loopWhile(() => awaitedCSS === undefined);

			return awaitedCSS;
		} catch (error) {
			if (severity === 'warn') {
				console.warn(error.message);
			} else if (severity !== 'ignore') {
				throw error;
			}

			return fallbackCSS;
		}
	}
}

// the name given for the default import
function getDefaultImportNameFromNodePath(nodePath) {
	return Object(Object(nodePath.node.specifiers.find(specifierNode => specifierNode.type === 'ImportDefaultSpecifier')).local).name;
}

// whether the pathname includes a file extension
function doesPathnameIncludeExtensions(pathname, extensions) {
	return extensions.some(
		extension => extension instanceof RegExp
			? extension.test(pathname)
		: pathname.slice(-extension.length) === String(extension)
	);
}
