import doesPathnameIncludeExtensions from './lib/doesPathnameIncludeExtensions';
import getDefaultImportNameFromNodePath from './lib/getDefaultImportNameFromNodePath';
import getInitialProcessOptsFromOpts from './lib/getInitialProcessOptsFromOpts';
import getPostCSSFromPathnameGenerator from './lib/getPostCSSFromPathnameGenerator';
import loadOptions from './lib/loadOptions';
import mapSugaryPostCSSPlugins from './lib/mapSugaryPostCSSPlugins';
import path from 'path';

export default function babelPluginImportPostCSS (api, rawopts) {
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
				exit (nodePath, state) {
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
