// remove plugin specific options and return the remaining process options
export default function getInitialProcessOptsFromOpts (opts) {
	const initialProcessOpts = Object.assign({}, opts);

	delete initialProcessOpts.extensions;
	delete initialProcessOpts.severity;
	delete initialProcessOpts.plugins;

	return initialProcessOpts;
}
