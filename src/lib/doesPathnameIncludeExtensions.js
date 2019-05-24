// whether the pathname includes a file extension
export default function doesPathnameIncludeExtensions (pathname, extensions) {
	return extensions.some(
		extension => extension instanceof RegExp
			? extension.test(pathname)
		: pathname.slice(-extension.length) === String(extension)
	);
}
