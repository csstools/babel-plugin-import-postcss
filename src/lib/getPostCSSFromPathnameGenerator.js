import deasync from 'deasync';
import fs from 'fs';
import postcss from 'postcss';

// a synchronous function that processes css
export default function getPostCSSFromPathnameGenerator (plugins, initialProcessOpts, severity) {
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



