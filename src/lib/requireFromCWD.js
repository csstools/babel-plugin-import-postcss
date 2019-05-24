// require a module or file in relationship to the current working directory
export default function requireFromCWD (id) {
	return require(require.resolve(id, { paths: [process.cwd()] }));
}
