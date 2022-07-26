import { useStore } from "./utilities/store";

// Core
export {
	createError,
	useCookie,
	useCookies,
	useBody,
	useRawBody,
	useQuery,
	setCookie,
	deleteCookie,
	isStream,
	sendStream,
	appendHeader,
	createRouter,
} from "h3";
export { start } from "./server";
export { defineMiddleware } from "./middleware/middleware";
export { definePlugin } from "./plugins/plugins";
export { defineRoute } from "./route/route";
export { defineServeConfig } from "./serve/serve";
export { sendSuccess, sendError, gql } from "./route/utilities";
export { defineEntity, defineEntityConfig } from "./entity/entity";

const [, getApp] = useStore("app");
export { getApp };

// Adapters
export { Logger } from "./adapter/internal/logger/logger";
export { Authorization } from "./adapter/types/authorization/authorization";

// GraphQL utilities and types
export {
	RenameTypes,
	FilterTypes,
	RenameRootTypes,
	TransformCompositeFields,
	TransformRootFields,
	RenameRootFields,
	FilterRootFields,
	TransformObjectFields,
	RenameObjectFields,
	RenameObjectFieldArguments,
	FilterObjectFields,
	TransformInterfaceFields,
	RenameInterfaceFields,
	FilterInterfaceFields,
	TransformInputObjectFields,
	RenameInputObjectFields,
	FilterInputObjectFields,
	MapLeafValues,
	TransformEnumValues,
	TransformQuery,
	FilterObjectFieldDirectives,
	RemoveObjectFieldDirectives,
	RemoveObjectFieldsWithDirective,
	RemoveObjectFieldDeprecations,
	RemoveObjectFieldsWithDeprecation,
	PruneSchema,
	WrapType,
	WrapFields,
	HoistField,
	MapFields,
	WrapQuery,
	ExtractField,
} from "@graphql-tools/wrap";
