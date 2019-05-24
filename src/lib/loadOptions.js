import cosmicconfig from 'cosmiconfig';
import deasync from 'deasync';

// load options from a postcss configuration file overridden by local options
export default function loadOptions (opts) {
	let awaitedResult;

	cosmicconfig('postcss').search().then(result => {
		awaitedResult = Object.assign(Object(Object(result).config), opts);
	});

	deasync.loopWhile(() => awaitedResult === undefined);

	return awaitedResult;
}
