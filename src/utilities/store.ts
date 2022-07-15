export const createStore = () => new Map();
export const moduleStore = createStore();
export const moduleConfigStore = createStore();
export const schemaDefinitionStore = createStore();

export const useStore = (key: string | symbol, store = serveStore) => {
	const handler: ProxyHandler<any> = {
		get: () => store.get(key),
		set: (value: any) => {
			store.set(key, value);

			return true;
		},
	};

	const proxy = new Proxy(Object.create(null), handler);

	return proxy[key];
};

export type StoreGetter = (key: string | symbol) => any;

const serveStore: Map<string | symbol, any> = createStore();
