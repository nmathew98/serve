import { AutoImportPreset } from "../auto-import";

export const createServePreset = async () => {
	const preset: AutoImportPreset = new Map();

	const e = [
		"createError",
		"useCookie",
		"useCookies",
		"useBody",
		"useRawBody",
		"useQuery",
		"setCookie",
		"deleteCookie",
		"isStream",
		"sendStream",
		"appendHeader",
		"createRouter",
		"RenameTypes",
		"FilterTypes",
		"RenameRootTypes",
		"TransformCompositeFields",
		"TransformRootFields",
		"RenameRootFields",
		"FilterRootFields",
		"TransformObjectFields",
		"RenameObjectFields",
		"RenameObjectFieldArguments",
		"FilterObjectFields",
		"TransformInterfaceFields",
		"RenameInterfaceFields",
		"FilterInterfaceFields",
		"TransformInputObjectFields",
		"RenameInputObjectFields",
		"FilterInputObjectFields",
		"MapLeafValues",
		"TransformEnumValues",
		"TransformQuery",
		"FilterObjectFieldDirectives",
		"RemoveObjectFieldDirectives",
		"RemoveObjectFieldsWithDirective",
		"RemoveObjectFieldDeprecations",
		"RemoveObjectFieldsWithDeprecation",
		"PruneSchema",
		"WrapType",
		"WrapFields",
		"HoistField",
		"MapFields",
		"WrapQuery",
		"ExtractField",
	];

	preset.set("@skulpture/serve", e);

	return preset;
};
