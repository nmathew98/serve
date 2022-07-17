import { readFile } from "fs/promises";
import ts from "typescript";

import { isImportable } from "../../../utilities/is-importable";
import { ls } from "../../../utilities/ls";

export const transformForVm = (code: string, format: TransformFormat) => {
	const printer = ts.createPrinter();
	const sourceFile = ts.createSourceFile(
		"transformed.ts",
		code,
		ts.ScriptTarget.Latest,
		undefined,
		ts.ScriptKind.Deferred,
	);

	const transformer = createTransformer(format);
	const result: ts.TransformationResult<ts.SourceFile> = ts.transform(
		sourceFile,
		[transformer],
	);

	const transformedSourceFile = result.transformed[0];

	if (transformedSourceFile) return printer.printFile(transformedSourceFile);
	else return code;
};

// TODO: Not so easy
const createTransformer: (
	format: TransformFormat,
) => ts.TransformerFactory<ts.SourceFile> = format => context => sourceFile => {
	const visitor = (node: ts.Node): ts.Node => {
		/**
		 * For each node we need to check if it is an arrow function
		 * or if its a function declaration. We also need to check
		 * the type of export.
		 *
		 * If it is what we're expecting then we should transform it
		 * to the shape we expect which is
		 * `export const ${format.toUpperCase()}_${id} = ${arrow function}`
		 *
		 * Compiler API reference:
		 * https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
		 *
		 * Transformer handbook:
		 * https://github.com/madou/typescript-transformer-handbook
		 */
		return ts.visitEachChild(node, visitor, context);
	};

	return ts.visitNode(sourceFile, visitor);
};

export const traverseDirs = async (
	path: string | string[],
	t: (code: string) => string,
) => {
	const dirsToTraverse = [];
	if (Array.isArray(path)) dirsToTraverse.push(...path);
	else dirsToTraverse.push(path);

	const files = [];
	for (const dir of dirsToTraverse) {
		for await (const file of ls(dir)) {
			if (isImportable(file)) files.push(file);
		}
	}

	const contents = await Promise.all(
		files.map(async file => (await readFile(file)).toString()),
	);

	return contents
		.filter(code => code.includes("export default"))
		.map(code => t(code))
		.join("\n");
};

export type TransformFormat =
	| "adapter"
	| "entity"
	| "composable"
	| "plugin"
	| "middleware"
	| "schemaDef"
	| "route";
