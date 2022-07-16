export const createStore = () => new Map();
export const moduleStore = createStore();
export const moduleConfigStore = createStore();
export const schemaDefinitionStore = createStore();

export const useStore = <T = any>(
	key: string | symbol,
	store = serveStore,
): [T, (value?: T) => T] => {
	return [
		store.get(key),
		(value?: T) => {
			if (value) store.set(key, value);

			return store.get(key);
		},
	];
};

export type Store = <T = any>(key: string | symbol) => [T, () => T];

const serveStore: Map<string | symbol, any> = createStore();
