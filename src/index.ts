// Hooks
export {
	initialize,
	useProjectConfiguration,
	useEntityConfiguration,
	useScripts,
} from "./server";

// Core
export { App } from "./listeners/app/app";
export * as H3 from "h3";
export { ServeContext } from "./listeners/context/context";

// Adapters
import Consola from "./adapters/logger/logger";
export { Consola };
export { Authorization } from "./adapters/authorization/authorization";
export { Logger } from "./adapters/logger/logger";
export { Storage } from "./adapters/storage/storage";

// Decorators
export { Route } from "./composables/decorators/route";
export { Methods } from "./composables/decorators/methods";
export { Middleware } from "./composables/decorators/middleware";
export { Modules } from "./composables/decorators/modules";
export { Protected } from "./composables/decorators/protected";

// Route utilities
export { BaseRoute, RouteError } from "./routes/route";
export {
	sendError,
	sendSuccess,
	useProduction,
	HttpErrorCodes,
	HttpSuccessCodes,
} from "./routes/utilities";

// GraphQL utilities and types
import doesModuleExist from "./composables/does-module-exist";
export { doesModuleExist };
export { GraphQLQueryHandler } from "./routes/api/queries/queries";
export { GraphQLMutationHandler } from "./routes/api/mutations/mutations";
export { GraphQLSubscriptionHandler } from "./routes/api/subscriptions/subscriptions";
export { GraphQLTypeHandler } from "./routes/api/types/types";
export { GraphQLField } from "./routes/api/schema/schema";

// Other utlities
// These utilities are provided because swc does not
// preserve the directory structure
import findRootDirectory from "./composables/find-root-directory";
import createFolder from "./composables/create-folder";
import isPathValid from "./composables/is-path-valid";
import useIn from "./composables/use-in";
import ls from "./composables/ls";
import loadConfig from "./composables/load-config";
import decorateObject from "./composables/decorate-object";
export {
	findRootDirectory,
	createFolder,
	isPathValid,
	ls,
	useIn,
	loadConfig,
	decorateObject,
};
