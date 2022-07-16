import { Logger } from "../adapter/internal/logger/logger";
import { moduleConfigStore, moduleStore, useStore } from "../utilities/store";

export const defineEntity = (builder: EntityBuilder) => async () => {
	const entityName = builder.name.replaceAll(/buildMake/g, "");

	if (builder.arguments.length > 1) {
		Logger.log(`${builder.name} should accept an object of its dependencies`);
		Logger.error(`❌ Invalid entity: ${entityName}`);
		return;
	}

	const s = builder.toString();

	const deps =
		s
			.toString()
			.match(/{.*}/)
			?.map(deps => deps.replaceAll(/{|}/g, "").trim().split(","))
			.flat()
			.map(dep => dep.trim()) || [];

	const adapters = deps.reduce((acc, dep) => {
		const adapter = useStore(dep, moduleStore);

		return {
			...acc,
			[dep]: adapter,
		};
	}, Object.create(null));

	// @ts-expect-error: its still being used as it will be set in the store
	let entity = useStore(entityName, moduleStore);
	const entityConfiguration = useStore(entityName, moduleConfigStore);

	const intermediate = builder(adapters);
	if (typeof intermediate === "function")
		entity = intermediate(entityConfiguration);
	else entity = intermediate;

	Logger.success(`✅ Loaded entity ${entityName}`);
};

export const defineEntityConfiguration =
	(name: string, configuration: Record<string, any>) => async () => {
		// @ts-expect-error: its still being used as it will be set in the store
		let entityConfiguration = useStore(name, moduleConfigStore);

		entityConfiguration = configuration;
	};

type EntityBuilder = (
	deps: Record<string, any>,
) =>
	| ((config: Record<string, any>) => Record<string, any>)
	| Record<string, any>;
