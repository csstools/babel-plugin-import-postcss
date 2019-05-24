// the name given for the default import
export default function getDefaultImportNameFromNodePath (nodePath) {
	return Object(Object(nodePath.node.specifiers.find(specifierNode => specifierNode.type === 'ImportDefaultSpecifier')).local).name;
}
